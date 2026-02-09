use wasm_bindgen::prelude::*;
use ed25519_dalek::SigningKey;
use rand::rngs::OsRng;

#[wasm_bindgen]
pub struct GrindResult {
    public_key: String,
    private_key: Vec<u8>,
    attempts: u64,
}

#[wasm_bindgen]
impl GrindResult {
    #[wasm_bindgen(getter)]
    pub fn public_key(&self) -> String {
        self.public_key.clone()
    }

    #[wasm_bindgen(getter)]
    pub fn private_key(&self) -> Vec<u8> {
        self.private_key.clone()
    }

    #[wasm_bindgen(getter)]
    pub fn attempts(&self) -> u64 {
        self.attempts
    }
}

#[wasm_bindgen]
pub fn grind(prefix: &str, suffix: &str, case_sensitive: bool, batch_size: u32) -> Option<GrindResult> {
    let prefix_check = if case_sensitive {
        prefix.to_string()
    } else {
        prefix.to_lowercase()
    };
    let suffix_check = if case_sensitive {
        suffix.to_string()
    } else {
        suffix.to_lowercase()
    };

    for i in 0..batch_size {
        let signing_key = SigningKey::generate(&mut OsRng);
        let verifying_key = signing_key.verifying_key();
        let address = bs58::encode(verifying_key.as_bytes()).into_string();

        let addr_cmp = if case_sensitive {
            address.clone()
        } else {
            address.to_lowercase()
        };

        let prefix_match = prefix_check.is_empty() || addr_cmp.starts_with(&prefix_check);
        let suffix_match = suffix_check.is_empty() || addr_cmp.ends_with(&suffix_check);

        if prefix_match && suffix_match {
            let mut full_key = Vec::with_capacity(64);
            full_key.extend_from_slice(signing_key.as_bytes());
            full_key.extend_from_slice(verifying_key.as_bytes());

            return Some(GrindResult {
                public_key: address,
                private_key: full_key,
                attempts: i as u64 + 1,
            });
        }
    }

    None
}

#[wasm_bindgen]
pub fn ping() -> String {
    "solvanity grinder ready".to_string()
}
