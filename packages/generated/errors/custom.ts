export type CustomError =
  | InsufficientFundsForTransaction
  | InvalidTreasury
  | InvalidMint

export class InsufficientFundsForTransaction extends Error {
  static readonly code = 6000
  readonly code = 6000
  readonly name = "InsufficientFundsForTransaction"
  readonly msg = "insufficient funds for transaction"

  constructor(readonly logs?: string[]) {
    super("6000: insufficient funds for transaction")
  }
}

export class InvalidTreasury extends Error {
  static readonly code = 6001
  readonly code = 6001
  readonly name = "InvalidTreasury"
  readonly msg = "invalid treasury account"

  constructor(readonly logs?: string[]) {
    super("6001: invalid treasury account")
  }
}

export class InvalidMint extends Error {
  static readonly code = 6002
  readonly code = 6002
  readonly name = "InvalidMint"
  readonly msg = "invalid mint"

  constructor(readonly logs?: string[]) {
    super("6002: invalid mint")
  }
}

export function fromCode(code: number, logs?: string[]): CustomError | null {
  switch (code) {
    case 6000:
      return new InsufficientFundsForTransaction(logs)
    case 6001:
      return new InvalidTreasury(logs)
    case 6002:
      return new InvalidMint(logs)
  }

  return null
}
