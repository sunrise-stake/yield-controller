import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { YieldController } from "../target/types/yield_controller";

describe("yield-controller", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.YieldController as Program<YieldController>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });
});
