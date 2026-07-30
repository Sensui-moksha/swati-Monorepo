#!/bin/bash
set -e

echo "====================================="
echo "   Enterprise Key Rotation Utility   "
echo "====================================="

# This script generates new secure keys for JWT and AES Encryption
# In production, these should be synced to a Secrets Manager (AWS Secrets Manager, HashiCorp Vault)

ENV_FILE="../backend/.env.production"

# Generate new 256-bit (32 byte) hex strings
NEW_JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
NEW_JWT_REFRESH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
NEW_AES_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

echo ""
echo "NEW_JWT_ACCESS_SECRET=$NEW_JWT_SECRET"
echo "NEW_JWT_REFRESH_SECRET=$NEW_JWT_REFRESH_SECRET"
echo "NEW_ENCRYPTION_KEY=$NEW_AES_KEY"
echo ""

echo "WARNING: Replacing the ENCRYPTION_KEY will render previously encrypted DB fields (like TOTP MFA secrets) undecipherable unless they are re-encrypted first."
echo "WARNING: Replacing the JWT Secrets will immediately invalidate all active user sessions."

read -p "Do you want to apply these to .env.production? (y/n): " apply_keys

if [ "$apply_keys" == "y" ]; then
    if [ -f "$ENV_FILE" ]; then
        # Replace existing keys or append them
        sed -i.bak -E "s/^JWT_ACCESS_SECRET=.*/JWT_ACCESS_SECRET=$NEW_JWT_SECRET/" "$ENV_FILE"
        sed -i.bak -E "s/^JWT_REFRESH_SECRET=.*/JWT_REFRESH_SECRET=$NEW_JWT_REFRESH_SECRET/" "$ENV_FILE"
        sed -i.bak -E "s/^ENCRYPTION_KEY=.*/ENCRYPTION_KEY=$NEW_AES_KEY/" "$ENV_FILE"
        echo "Keys rotated successfully in $ENV_FILE. Please restart the backend service."
    else
        echo "Could not find $ENV_FILE. Please update your environment variables manually."
    fi
else
    echo "Aborted."
fi
