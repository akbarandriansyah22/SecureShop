package models

import "database/sql"

// NullString returns the string value, or "" when the column is NULL.
func NullString(ns sql.NullString) string {
	if ns.Valid {
		return ns.String
	}
	return ""
}

// NullInt32 returns a pointer when the column is set.
func NullInt32(ns sql.NullInt32) *int {
	if !ns.Valid {
		return nil
	}
	value := int(ns.Int32)
	return &value
}
