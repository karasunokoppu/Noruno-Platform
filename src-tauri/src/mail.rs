use crate::settings::MailSettings;
use lettre::transport::smtp::authentication::Credentials;
use lettre::{Message, SmtpTransport, Transport};

pub fn send_email(
    settings: &MailSettings,
    to: &str,
    subject: &str,
    body: &str,
) -> Result<(), String> {
    if settings.email.is_empty() || settings.app_password.is_empty() {
        return Err("Email settings are not configured".to_string());
    }

    let email = Message::builder()
        .from(
            settings
                .email
                .parse()
                .map_err(|e: lettre::address::AddressError| e.to_string())?,
        )
        .to(to
            .parse()
            .map_err(|e: lettre::address::AddressError| e.to_string())?)
        .subject(subject)
        .body(body.to_string())
        .map_err(|e| e.to_string())?;

    let creds = Credentials::new(settings.email.clone(), settings.app_password.clone());

    // Open connection to Gmail
    let mailer = SmtpTransport::relay("smtp.gmail.com")
        .map_err(|e| e.to_string())?
        .credentials(creds)
        .build();

    // Send the email
    match mailer.send(&email) {
        Ok(_) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}
