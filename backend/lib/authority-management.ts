export interface AuthorityRegistry {
  [address: string]: {
    officialId: string
    level: "admin" | "moderator" | "observer"
    addedAt: number
    isActive: boolean
    actions: string[]
  }
}

export class AuthorityManagementService {
  private static authorities: AuthorityRegistry = {}

  /**
   * Register a new authority
   */
  static registerAuthority(address: string, officialId: string, level: "admin" | "moderator" | "observer"): void {
    this.authorities[address] = {
      officialId,
      level,
      addedAt: Math.floor(Date.now() / 1000),
      isActive: true,
      actions: [],
    }
  }

  /**
   * Get authority info
   */
  static getAuthority(address: string) {
    return this.authorities[address]
  }

  /**
   * List all active authorities
   */
  static listAuthorities() {
    return Object.entries(this.authorities)
      .filter(([_, auth]) => auth.isActive)
      .map(([address, auth]) => ({ address, ...auth }))
  }

  /**
   * Revoke authority
   */
  static revokeAuthority(address: string): void {
    if (this.authorities[address]) {
      this.authorities[address].isActive = false
    }
  }

  /**
   * Record authority action
   */
  static recordAction(address: string, action: string): void {
    if (this.authorities[address]) {
      this.authorities[address].actions.push(action)
    }
  }

  /**
   * Get authority action history
   */
  static getActionHistory(address: string): string[] {
    return this.authorities[address]?.actions || []
  }

  /**
   * Audit log for authorities
   */
  static getAuditLog() {
    const log: any[] = []

    for (const [address, auth] of Object.entries(this.authorities)) {
      log.push({
        address,
        officialId: auth.officialId,
        level: auth.level,
        addedAt: auth.addedAt,
        isActive: auth.isActive,
        actionCount: auth.actions.length,
      })
    }

    return log
  }
}
