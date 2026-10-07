package security

import (
	"encoding/base64"
	"strings"
	"testing"
)

func TestParseTokenRejectsAlgNone(t *testing.T) {
	header := base64.RawURLEncoding.EncodeToString([]byte(`{"alg":"none","typ":"JWT"}`))
	payload := base64.RawURLEncoding.EncodeToString([]byte(`{"user_id":1,"email":"a@a.a","role_id":1,"full_name":"x","token_version":0,"exp":9999999999}`))
	token := header + "." + payload + "."
	if _, err := ParseToken(token, "test-secret-must-be-at-least-32-chars"); err == nil {
		t.Fatal("alg none was accepted")
	} else if !strings.Contains(err.Error(), "signing method") && !strings.Contains(err.Error(), "failed to parse") {
		t.Fatalf("unexpected error: %v", err)
	}
}
