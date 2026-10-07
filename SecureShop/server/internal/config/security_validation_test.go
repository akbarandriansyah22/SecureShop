package config

import (
	"strings"
	"testing"
	"time"
)

func validConfig() *Config {
	return &Config{
		Database: DatabaseConfig{Password: "a-real-db-password-1", SSLMode: "disable"},
		Server:   ServerConfig{Environment: "development"},
		JWT:      JWTConfig{Secret: "0123456789abcdef0123456789abcdef", Expiration: 2 * time.Hour},
		CORS:     CORSConfig{AllowedOrigins: []string{"*"}},
	}
}

func TestValidateSecretsRejectsComposePlaceholder(t *testing.T) {
	t.Setenv("METRICS_TOKEN", "0123456789abcdef0123456789abcdef")
	cfg := validConfig()
	cfg.JWT.Secret = "replace-with-openssl-rand-hex-32-value-here"
	err := cfg.validateSecrets()
	if err == nil || !strings.Contains(err.Error(), "JWT_SECRET") {
		t.Fatalf("got %v", err)
	}
}

func TestValidateSecretsRejectsShortDBPassword(t *testing.T) {
	t.Setenv("METRICS_TOKEN", "0123456789abcdef0123456789abcdef")
	cfg := validConfig()
	cfg.Database.Password = "change-me"
	err := cfg.validateSecrets()
	if err == nil || !strings.Contains(err.Error(), "DB_PASSWORD") {
		t.Fatalf("got %v", err)
	}
}

func TestValidateSecretsRejectsWildcardCORSInProduction(t *testing.T) {
	t.Setenv("METRICS_TOKEN", "0123456789abcdef0123456789abcdef")
	cfg := validConfig()
	cfg.Server.Environment = "production"
	cfg.Database.SSLMode = "require"
	err := cfg.validateSecrets()
	if err == nil || !strings.Contains(err.Error(), "CORS") {
		t.Fatalf("got %v", err)
	}
}
