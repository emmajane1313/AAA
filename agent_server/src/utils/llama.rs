use crate::{
    utils::{constants::LLAMA_URL, types::LlamaOptions},
    Collection,
};

use rand::{random, thread_rng, Rng};
use reqwest::Client;
use serde_json::json;
use std::{env, error::Error, io, time::Duration};

pub async fn call_llama(
    account_address: &str,
    collection: &Collection,
) -> Result<(), Box<dyn Error + Send + Sync>> {
    let llama_key = env::var("OLLAMA_KEY").expect("OLLAMA_KEY not configured in .env");
    let limit = [100, 200, 350][thread_rng().gen_range(0..3)];
    let prompt = "";

    let cliente = Client::builder()
        .danger_accept_invalid_certs(true)
        .danger_accept_invalid_hostnames(true)
        .timeout(Duration::from_secs(10000))
        .connect_timeout(Duration::from_secs(10000))
        .read_timeout(Duration::from_secs(10000))
        .pool_idle_timeout(Duration::from_secs(10000))
        .pool_max_idle_per_host(10000)
        .use_rustls_tls()
        .no_gzip()
        .no_brotli()
        .no_deflate()
        .no_proxy()
        .build()?;
    let payload_inicial = json!({
        "api_key": llama_key,
        "prompt": prompt.trim(),
        "collection": collection,
        "model": "Meta-Llama-3.1-8B-Instruct-Q8_0.gguf",
        "options": LlamaOptions {
            num_keep: 5,
            seed: random::<i32>(),
            num_predict: limit,
            top_k: 20,
            top_p: 0.9,
            ctx: 8192,
            min_p: 0.0,
            tfs_z: 0.5,
            typical_p: 0.7,
            repeat_last_n: 33,
            temperature: 0.8,
            repeat_penalty: 1.2,
            presence_penalty: 1.5,
            frequency_penalty: 1.0,
            mirostat: 1,
            mirostat_tau: 0.8,
            mirostat_eta: 0.6,
            penalize_newline: true,
            numa: false,
            num_tokens: limit,
            num_batch: 2,
            num_gpu: 18,
            main_gpu: 0,
            low_vram: false,
            f16_kv: true,
            vocab_only: false,
            use_mmap: true,
            use_mlock: false,
            num_thread: 8
        },
        "account_address": account_address,
    });

    let response = cliente
        .post(LLAMA_URL)
        .header("Content-Type", "application/json; charset=UTF-8")
        .json(&payload_inicial)
        .send()
        .await?;

    if response.status() == 200 {
        println!("Llama call successful");
        Ok(())
    } else {
        return Err(Box::new(io::Error::new(
            io::ErrorKind::Other,
            format!("Error in obtaining llama prompt {:?}", response.status()),
        )));
    }
}
