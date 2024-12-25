use std::{
    collections::BTreeMap,
    sync::Arc,
    time::{SystemTime, UNIX_EPOCH},
};

use crate::{
    utils::contracts::{initialize_api, initialize_wallet},
    LensTokens, SavedTokens,
};
use ethers::{
    signers::{LocalWallet, Signer},
    types::transaction::eip712::{EIP712Domain, Eip712DomainType, TypedData},
    utils::hex,
};
use reqwest::Client;
use serde_json::{json, Value};

use super::constants::LENS_API;

async fn refresh(
    client: Arc<Client>,
    refresh_tokens: &str,
    auth_tokens: &str,
) -> Result<LensTokens, Box<dyn std::error::Error>> {
    let query = json!({
        "query": r#"
            mutation Refresh($request: RefreshRequest!) {
                refresh(request: $request) {
                    accessToken
                    refreshToken
                    idToken
                }
            }
        "#,
        "variables": {
            "request": {
                "refreshToken": refresh_tokens.to_string()
            }
        }
    });

    let response = client
        .post(LENS_API)
        .header("Authorization", format!("Bearer {}", auth_tokens))
        .header("Content-Type", "application/json")
        .json(&query)
        .send()
        .await?;

    if response.status().is_success() {
        let json: serde_json::Value = response.json().await?;
        if let Some(authentication) = json["data"]["refresh"].as_object() {
            Ok(LensTokens {
                access_token: authentication
                    .get("accessToken")
                    .and_then(|v| v.as_str())
                    .unwrap_or_default()
                    .to_string(),
                refresh_token: authentication
                    .get("refreshToken")
                    .and_then(|v| v.as_str())
                    .unwrap_or_default()
                    .to_string(),
                id_token: authentication
                    .get("idToken")
                    .and_then(|v| v.as_str())
                    .unwrap_or_default()
                    .to_string(),
            })
        } else {
            return Err("Unexpected Structure.".into());
        }
    } else {
        return Err(format!("Error: {}", response.status()).into());
    }
}

pub async fn authenticate(
    client: Arc<Client>,
    wallet: &LocalWallet,
    account_address: &str,
) -> Result<LensTokens, Box<dyn std::error::Error>> {
    let mutation = json!({
        "query": r#"
        mutation Challenge($request: ChallengeRequest!) {
            challenge(request: $request) {
                __typename
                id
                text
            }
        }
    "#,
        "variables": {
            "request": {
                "accountOwner": {
                    "app": "0xe5439696f4057aF073c0FB2dc6e5e755392922e1",
                    "account": wallet.address(),
                    "owner": account_address
                }
            }
        }
    });

    let response = client
        .post(LENS_API)
        .header("Content-Type", "application/json")
        .json(&mutation)
        .send()
        .await?;

    if response.status().is_success() {
        let json: Value = response.json().await?;
        if let Some(challenge) = json["data"]["challenge"].as_object() {
            let text = challenge
                .get("text")
                .and_then(|v| v.as_str())
                .unwrap_or_default();
            let signature = wallet.sign_message(text).await?;

            let authenticate_mutation = json!({
                "query": r#"
                mutation Authenticate($request: SignedAuthChallenge!) {
                    authenticate(request: $request) {
                        ... on AuthenticationTokens {
                            accessToken
                            refreshToken
                            idToken
                        }
                        ... on WrongSignerError {
                            reason
                        }
                        ... on ExpiredChallengeError {
                            reason
                        }
                        ... on ForbiddenError {
                            reason
                        }
                    }
                }
            "#,
                "variables": {
                    "request": {
                        "id": challenge
                            .get("id")
                            .and_then(|v| v.as_str())
                            .unwrap_or_default(),
                        "signature": format!("0x{}", hex::encode(signature.to_vec())),
                    }
                }
            });

            let response = client
                .post(LENS_API)
                .header("Content-Type", "application/json")
                .json(&authenticate_mutation)
                .send()
                .await?;

            if response.status().is_success() {
                let json: Value = response.json().await?;
                if let Some(authentication) = json["data"]["authenticate"].as_object() {
                    return Ok(LensTokens {
                        access_token: authentication
                            .get("accessToken")
                            .and_then(|v| v.as_str())
                            .unwrap_or_default()
                            .to_string(),
                        refresh_token: authentication
                            .get("refreshToken")
                            .and_then(|v| v.as_str())
                            .unwrap_or_default()
                            .to_string(),
                        id_token: authentication
                            .get("idToken")
                            .and_then(|v| v.as_str())
                            .unwrap_or_default()
                            .to_string(),
                    });
                } else {
                    return Err("Authentication failed.".into());
                }
            } else {
                return Err(format!("Error: {}", response.status()).into());
            }
        } else {
            return Err("Challenge response structure invalid.".into());
        }
    } else {
        return Err(format!("Error: {}", response.status()).into());
    }
}

pub async fn handle_tokens(
    private_key: &str,
    account_address: &str,
    tokens: Option<SavedTokens>,
) -> Result<SavedTokens, Box<dyn std::error::Error>> {
    let client = initialize_api();
    let wallet = initialize_wallet(&private_key);

    if let Some(saved) = tokens {
        let now = SystemTime::now().duration_since(UNIX_EPOCH)?.as_secs();

        if now < saved.expiry.try_into().unwrap() {
            return Ok(saved);
        } else {
            let new_tokens = refresh(
                client,
                &saved.tokens.refresh_token,
                &saved.tokens.access_token,
            )
            .await?;

            return Ok(SavedTokens {
                expiry: (SystemTime::now().duration_since(UNIX_EPOCH)?.as_secs() + 30 * 60) as i64,
                tokens: new_tokens,
            });
        }
    } else {
        let new_tokens = authenticate(client, &wallet, account_address).await?;
        return Ok(SavedTokens {
            expiry: (SystemTime::now().duration_since(UNIX_EPOCH)?.as_secs() + 30 * 60) as i64,
            tokens: new_tokens,
        });
    }
}

pub async fn make_publication(
    private_key: &str,
    content: String,
    auth_tokens: &str,
) -> Result<String, Box<dyn std::error::Error>> {
    let client = initialize_api();
    let wallet = initialize_wallet(&private_key);

    let query = json!({
        "query": r#"
            mutation post($contentUri: String!) {
                createOnchainPostTypedData({ contentUri: $contentUri }) {
       ... on PostResponse {
      hash
    }

      ... on SponsoredTransactionRequest {
      ...SponsoredTransactionRequest
    }

    ... on SelfFundedTransactionRequest {
      ...SelfFundedTransactionRequest
    }

    ... on TransactionWillFail {
      reason
    }
      }
    }
            }
        "#,
        "variables": {
            "request": {
                "contentURI": content,
            }
        }
    });

    let respuesta = client
        .post(LENS_API)
        .header("Authorization", format!("Bearer {}", auth_tokens))
        .header("Content-Type", "application/json")
        .json(&query)
        .send()
        .await?;

    if respuesta.status().is_success() {
        let json: serde_json::Value = respuesta.json().await?;

        if let Some(datos) = json["data"]["createOnchainPostTypedData"].as_object() {
            let datos_escritos = datos.get("typedData").and_then(|v| v.as_object()).unwrap();

            let domain = serde_json::from_value::<EIP712Domain>(
                datos_escritos.get("domain").cloned().unwrap(),
            )?;
            let types = serde_json::from_value::<BTreeMap<String, Vec<Eip712DomainType>>>(
                datos_escritos.get("types").cloned().unwrap(),
            )?;
            let value = serde_json::from_value::<BTreeMap<String, serde_json::Value>>(
                datos_escritos.get("value").cloned().unwrap(),
            )?;

            let signature = wallet
                .sign_typed_data(&TypedData {
                    domain,
                    types,
                    primary_type: "Post".to_string(),
                    message: value,
                })
                .await?;

            return Ok(propagate(
                datos.get("id").and_then(|v| v.as_str()).unwrap_or_default(),
                &signature.to_string(),
                auth_tokens,
            )
            .await?);
        } else {
            return Err("Estructura de respuesta inesperada Publicacion.".into());
        }
    } else {
        return Err(format!("Error: {}", respuesta.status()).into());
    }
}

async fn propagate(
    id: &str,
    signature: &str,
    auth_tokens: &str,
) -> Result<String, Box<dyn std::error::Error>> {
    let client = initialize_api();
    let query = json!({
        "query": r#"
            mutation BroadcastOnchain($request: BroadcastRequest!) {
                broadcastOnchain(request: $request) {
                    ... on RelaySuccess {
        txId
      }
      ... on RelayError {
        reason
      }
                }
            }
        "#,
        "variables": {
            "request": {
                    "id": id,
                    "signature": signature
            }
        }
    });

    let response = client
        .post(LENS_API)
        .header("Authorization", format!("Bearer {}", auth_tokens))
        .header("Content-Type", "application/json")
        .json(&query)
        .send()
        .await?;

    if response.status().is_success() {
        let json: serde_json::Value = response.json().await?;
        if let Some(_) = json["data"]["broadcastOnchain"]["txId"].as_str() {
            return Ok("RelaySuccess".to_string());
        } else {
            return Ok("RelayError".to_string());
        }
    } else {
        return Err(format!("Error: {}", response.status()).into());
    }
}
