use config::Config;
use error::Error;
use turbopath::AbsoluteSystemPath;

mod config;
pub mod error;

pub const MICROFRONTEND_CONFIG_DEFAULT_FILE_PATH: &str = "micro-fontends.config.json";

#[derive(Debug)]
pub struct MicroFrontendConfig {
    config: Config,
}

impl MicroFrontendConfig {
    pub fn new(config_path: &AbsoluteSystemPath) -> Result<Option<Self>, Error> {
        let Some(config) = Config::load(config_path)? else {
            return Ok(None);
        };
        Ok(Some(Self { config }))
    }

    /// Given a relative path, this function returns the name of the
    /// micro-frontend that serves the path
    pub fn application_for_path(&self, path: &str) -> Result<&str, Error> {
        if !path.starts_with('/') {
            return Err(Error::NonRelative);
        }
        todo!()
    }
}
