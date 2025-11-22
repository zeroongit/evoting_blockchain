import { create } from "ipfs-http-client"

const IPFS_PROJECT_ID = process.env.NEXT_PUBLIC_IPFS_PROJECT_ID
const IPFS_PROJECT_SECRET = process.env.NEXT_PUBLIC_IPFS_PROJECT_SECRET

let ipfsClient: any = null

export async function getIPFSClient() {
  if (!ipfsClient) {
    const auth = Buffer.from(`${IPFS_PROJECT_ID}:${IPFS_PROJECT_SECRET}`).toString("base64")

    ipfsClient = create({
      host: "ipfs.infura.io",
      port: 5001,
      protocol: "https",
      headers: {
        authorization: `Basic ${auth}`,
      },
    })
  }
  return ipfsClient
}

export async function uploadToIPFS(data: any, filename: string) {
  const client = await getIPFSClient()
  const file = new File([JSON.stringify(data)], filename)
  const result = await client.add(file)
  return result.path
}

export async function downloadFromIPFS(hash: string) {
  const client = await getIPFSClient()
  const stream = client.cat(hash)
  let data = ""
  for await (const chunk of stream) {
    data += new TextDecoder().decode(chunk)
  }
  return JSON.parse(data)
}
