use crate::Collection;

use rand::{thread_rng, Rng};
use reqwest::Client;
use serde_json::{json, Value};
use std::{env, error::Error, io};

pub async fn call_chat_completion(
    collection: &Collection,
    custom_instructions: &str,
) -> Result<String, Box<dyn Error + Send + Sync>> {
    let open_ai_key: String =
        env::var("OPEN_AI_SECRET").expect("OPEN_AI_SECRET not configured in .env");
    let max_completion_tokens = [100, 200, 350][thread_rng().gen_range(0..3)];
    let input_prompt = 
    format!("Write some meta response/insight that could be used as a publication to social media about this collection and it's description {}", collection.description);

    let mut messages = vec![];

    messages.push(json!({
        "role": "system",
        "content": custom_instructions
    }));
    messages.push(json!({
        "role": "user",
        "content": input_prompt
    }));

    let client = Client::new();
    let  request_body = json!({
        "model": "gpt-4o-mini",
        "messages": messages,
        "max_completion_tokens": max_completion_tokens,
        "n": 1,
    });

    let response = client
        .post("https://api.openai.com/v1/chat/completions")
        .header("Authorization", format!("Bearer {}", open_ai_key))
        .json(&request_body)
        .send()
        .await;

    let response = match response {
        Ok(resp) => resp,
        Err(e) => {
            eprintln!("Error sending request to OpenAI API: {}", e);
            return Err(e.into());
        }
    };
    if response.status() == 200 {
    let response_json: Value = response.json().await?;
    let completion = response_json["choices"][0]["message"]["content"]
        .as_str()
        .unwrap_or("")
        .to_string();

 
        println!("Open AI call successful");
        Ok(completion)
    } else {
        return Err(Box::new(io::Error::new(
            io::ErrorKind::Other,
            format!("Error in obtaining open AI prompt {:?}", response.status()),
        )));
    }
}