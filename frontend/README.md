# 🎨 Frontend Next.js - E-Voting Election

This directory contains the user interface (UI) for the E-Voting Election system. Built using **Next.js (App Router)**, **React**, **Tailwind CSS**, and integrated with Web3 via the **viem** library to read and write data to the Smart Contract on the Avalanche Fuji network.

## 🌟 Available Page Modules
- **Voter Portal (`/vote`)**: The digital ballot booth interface featuring *liveness detection* (simulated for NIK ending in 999) and the generation of *Zero-Knowledge Proofs* using direct *client-side* execution of the `snarkjs` library.
- **Admin Portal (`/admin`)**: The committee authorization dashboard to start/stop the election session on-chain and manipulate dummy DPT (voter roll) data. This page requires strict authentication using the **Core Wallet** extension.

## 🛠️ Environment Requirements
- **Node.js** (v18 or newer), it is recommended to manage it via `nvm`.
- **NPM** or **Yarn**
- **Core Wallet** Browser Extension (MetaMask is prohibited in the provider injection validation on the Admin page).

## 🚀 How to Run the Frontend Locally

1. **Install NPM dependencies:**
   ```bash
   npm install
   ```

2. **Set Environment Variables (Optional):**
   By default, the frontend calls the Golang backend via the `http://localhost:8080/api/v1` route. If you need to change it, create a `.env.local` file and add:
   ```env
   NEXT_PUBLIC_BACKEND_GO_URL=http://localhost:8080/api/v1
   ```
   *Note: The Avalanche E-Voting Smart Contract address configuration is centrally located in `lib/constants.ts`.*

3. **Run the development server:**
   ```bash
   npm run dev
   ```
   
4. **Access the application:**
   Open http://localhost:3000 in your web browser. You can try the `/vote` and `/admin` routes.

## 📂 Specific Directory Structure
- `app/` - Page route architecture setup with Next.js App Router (`/admin/page.tsx`, `/vote/page.tsx`).
- `components/` - Modular reusable UI components (e.g., `FaceVerification.tsx` design, *Tailwind/shadcn* buttons).
- `lib/` - Contains utility files, static data (`candidateData.ts`), and *Smart Contract ABI* JSON structures (`constants.ts`).
- `public/`
  - `circuits/` - Essential directory for storing `.wasm` and `.zkey` files (Circom Circuits). These files will be downloaded statically into the voter's *browser* when they cast their *vote* to execute *Client-Side Proving ZK-SNARK*.
