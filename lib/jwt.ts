import * as jose from 'jose';

/**
 * Generate a partner login token for connecting users to MonHubImmo
 * @param userId - The MonHubImmo user ID
 * @param partnerId - The partner network ID
 * @param jwtSecret - The partner's JWT secret (64 hex characters)
 * @param expiresIn - Token expiration (default: 5 minutes)
 * @returns Signed JWT token
 */
export async function generatePartnerLoginToken(
	userId: string,
	partnerId: string,
	jwtSecret: string,
	expiresIn: string = '5m'
): Promise<string> {
	// Encode the secret as Uint8Array for jose
	const secret = new TextEncoder().encode(jwtSecret);

	// Create the JWT
	const token = await new jose.SignJWT({
		userId,
		partnerId,
	})
		.setProtectedHeader({ alg: 'HS256' })
		.setIssuedAt()
		.setExpirationTime(expiresIn)
		.sign(secret);

	return token;
}
