import { encodeAbiParameters, parseAbiParameters } from "viem";

export function packGroth16ProofToBytes(proof: any) {
    const a: [bigint, bigint] = [BigInt(proof.pi_a[0]), BigInt(proof.pi_a[1])];
    const b: [[bigint, bigint], [bigint, bigint]] = [
        [BigInt(proof.pi_b[0][0]), BigInt(proof.pi_b[0][1])],
        [BigInt(proof.pi_b[1][0]), BigInt(proof.pi_b[1][1])]
    ];
    const c: [bigint, bigint] = [BigInt(proof.pi_c[0]), BigInt(proof.pi_c[1])];

    const encoded = encodeAbiParameters(
        parseAbiParameters("uint256[2] a, uint256[2][2] b, uint256[2] c"),
        [a,b,c]
    );
    return encoded;
}