const { KEY } = require('../../constants/bitcoin/derivation')
const { getAddressFromXpub } = require('../../../services/bitcoin')

// getAddressFromXpub(extPubKey, keyIndex, purpose, change, accountNumber)

describe("getAddressFromXpub() with invalid xpubs", () => {
  test("address generation from invalid xpub fails", () => {
    expect(getAddressFromXpub('')).toBeFalsy()
    expect(getAddressFromXpub('xpub123')).toBeFalsy()
  })
  test("address generation with invalid parameters fails", () => {
    expect(
      getAddressFromXpub(KEY.MAIN.XPUB, -1)
    ).toBeFalsy()
    expect(
      getAddressFromXpub(KEY.TEST.TPUB, 0, '99')
    ).toBeFalsy()
  })
})

describe("getAddressFromXpub(MAINNET)", () => {
  // BIP 44
  test("P2PKH address generation from xpub", () => {
    expect(
      getAddressFromXpub(KEY.MAIN.XPUB, 0, 'P2PKH', 0, 0).address
    ).toBe(KEY.MAIN.LEGACY)
  })
  test("P2PKH address generation from ypub", () => {
    expect(
      getAddressFromXpub(KEY.MAIN.YPUB, 0, 'P2PKH', 0, 0).address
    ).toBe(KEY.MAIN.LEGACY)
  })
  test("P2PKH address generation from zpub", () => {
    expect(
      getAddressFromXpub(KEY.MAIN.ZPUB, 0, 'P2PKH', 0, 0).address
    ).toBe(KEY.MAIN.LEGACY)
  })
  test("P2PKH address generation key index 3 from xpub", () => {
    expect(
      getAddressFromXpub(KEY.MAIN.XPUB, 3, 'P2PKH', 0, 0).address
    ).toBe(KEY.MAIN.LEGACY_3)
  })
  test("P2PKH address generation key index 3 from ypub", () => {
    expect(
      getAddressFromXpub(KEY.MAIN.YPUB, 3, 'P2PKH', 0, 0).address
    ).toBe(KEY.MAIN.LEGACY_3)
  })
  test("P2PKH address generation key index 3 from zpub", () => {
    expect(
      getAddressFromXpub(KEY.MAIN.ZPUB, 3, 'P2PKH', 0, 0).address
    ).toBe(KEY.MAIN.LEGACY_3)
  })
  test("P2PKH change address generation from xpub", () => {
    expect(
      getAddressFromXpub(KEY.MAIN.XPUB, 0, 'P2PKH', 1, 0).address
    ).toBe(KEY.MAIN.CHANGE.LEGACY)
  })
  test("P2PKH change address generation from ypub", () => {
    expect(
      getAddressFromXpub(KEY.MAIN.YPUB, 0, 'P2PKH', 1, 0).address
    ).toBe(KEY.MAIN.CHANGE.LEGACY)
  })
  test("P2PKH change address generation from zpub", () => {
    expect(
      getAddressFromXpub(KEY.MAIN.ZPUB, 0, 'P2PKH', 1, 0).address
    ).toBe(KEY.MAIN.CHANGE.LEGACY)
  })
  test("P2PKH change address generation key index 3 from xpub", () => {
    expect(
      getAddressFromXpub(KEY.MAIN.XPUB, 3, 'P2PKH', 1, 0).address
    ).toBe(KEY.MAIN.CHANGE_3.LEGACY)
  })
  test("P2PKH change address generation key index 3 from ypub", () => {
    expect(
      getAddressFromXpub(KEY.MAIN.YPUB, 3, 'P2PKH', 1, 0).address
    ).toBe(KEY.MAIN.CHANGE_3.LEGACY)
  })
  test("P2PKH change address generation key index 3 from zpub", () => {
    expect(
      getAddressFromXpub(KEY.MAIN.ZPUB, 3, 'P2PKH', 1, 0).address
    ).toBe(KEY.MAIN.CHANGE_3.LEGACY)
  })

  // BIP 49
  test("P2SH address generation from xpub", () => {
    expect(
      getAddressFromXpub(KEY.MAIN.XPUB, 0, 'P2SH', 0, 0).address
    ).toBe(KEY.MAIN.SEGWIT)
  })
  test("P2SH address generation from ypub", () => {
    expect(
      getAddressFromXpub(KEY.MAIN.YPUB, 0, 'P2SH', 0, 0).address
    ).toBe(KEY.MAIN.SEGWIT)
  })
  test("P2SH address generation from zpub", () => {
    expect(
      getAddressFromXpub(KEY.MAIN.ZPUB, 0, 'P2SH', 0, 0).address
    ).toBe(KEY.MAIN.SEGWIT)
  })
  test("P2SH address generation key index 3 from xpub", () => {
    expect(
      getAddressFromXpub(KEY.MAIN.XPUB, 3, 'P2SH', 0, 0).address
    ).toBe(KEY.MAIN.SEGWIT_3)
  })
  test("P2SH address generation key index 3 from ypub", () => {
    expect(
      getAddressFromXpub(KEY.MAIN.YPUB, 3, 'P2SH', 0, 0).address
    ).toBe(KEY.MAIN.SEGWIT_3)
  })
  test("P2SH address generation key index 3 from zpub", () => {
    expect(
      getAddressFromXpub(KEY.MAIN.ZPUB, 3, 'P2SH', 0, 0).address
    ).toBe(KEY.MAIN.SEGWIT_3)
  })
  test("P2SH change address generation from xpub", () => {
    expect(
      getAddressFromXpub(KEY.MAIN.XPUB, 0, 'P2SH', 1, 0).address
    ).toBe(KEY.MAIN.CHANGE.SEGWIT)
  })
  test("P2SH change address generation from ypub", () => {
    expect(
      getAddressFromXpub(KEY.MAIN.YPUB, 0, 'P2SH', 1, 0).address
    ).toBe(KEY.MAIN.CHANGE.SEGWIT)
  })
  test("P2SH change address generation from zpub", () => {
    expect(
      getAddressFromXpub(KEY.MAIN.ZPUB, 0, 'P2SH', 1, 0).address
    ).toBe(KEY.MAIN.CHANGE.SEGWIT)
  })
  test("P2SH change address generation key index 3 from xpub", () => {
    expect(
      getAddressFromXpub(KEY.MAIN.XPUB, 3, 'P2SH', 1, 0).address
    ).toBe(KEY.MAIN.CHANGE_3.SEGWIT)
  })
  test("P2SH change address generation key index 3 from ypub", () => {
    expect(
      getAddressFromXpub(KEY.MAIN.YPUB, 3, 'P2SH', 1, 0).address
    ).toBe(KEY.MAIN.CHANGE_3.SEGWIT)
  })
  test("P2SH change address generation key index 3 from zpub", () => {
    expect(
      getAddressFromXpub(KEY.MAIN.ZPUB, 3, 'P2SH', 1, 0).address
    ).toBe(KEY.MAIN.CHANGE_3.SEGWIT)
  })

  // BIP 84
  test("P2WPKH address generation from xpub", () => {
    expect(
      getAddressFromXpub(KEY.MAIN.XPUB, 0, 'P2WPKH', 0, 0).address
    ).toBe(KEY.MAIN.BECH32)
  })
  test("P2WPKH address generation from ypub", () => {
    expect(
      getAddressFromXpub(KEY.MAIN.YPUB, 0, 'P2WPKH', 0, 0).address
    ).toBe(KEY.MAIN.BECH32)
  })
  test("P2WPKH address generation from zpub", () => {
    expect(
      getAddressFromXpub(KEY.MAIN.ZPUB, 0, 'P2WPKH', 0, 0).address
    ).toBe(KEY.MAIN.BECH32)
  })
  test("P2WPKH address generation key index 3 from xpub", () => {
    expect(
      getAddressFromXpub(KEY.MAIN.XPUB, 3, 'P2WPKH', 0, 0).address
    ).toBe(KEY.MAIN.BECH32_3)
  })
  test("P2WPKH address generation key index 3 from ypub", () => {
    expect(
      getAddressFromXpub(KEY.MAIN.YPUB, 3, 'P2WPKH', 0, 0).address
    ).toBe(KEY.MAIN.BECH32_3)
  })
  test("P2WPKH address generation key index 3 from zpub", () => {
    expect(
      getAddressFromXpub(KEY.MAIN.ZPUB, 3, 'P2WPKH', 0, 0).address
    ).toBe(KEY.MAIN.BECH32_3)
  })
  test("P2WPKH change address generation from xpub", () => {
    expect(
      getAddressFromXpub(KEY.MAIN.XPUB, 0, 'P2WPKH', 1, 0).address
    ).toBe(KEY.MAIN.CHANGE.BECH32)
  })
  test("P2WPKH change address generation from ypub", () => {
    expect(
      getAddressFromXpub(KEY.MAIN.YPUB, 0, 'P2WPKH', 1, 0).address
    ).toBe(KEY.MAIN.CHANGE.BECH32)
  })
  test("P2WPKH change address generation from zpub", () => {
    expect(
      getAddressFromXpub(KEY.MAIN.ZPUB, 0, 'P2WPKH', 1, 0).address
    ).toBe(KEY.MAIN.CHANGE.BECH32)
  })
  test("P2WPKH change address generation key index 3 from xpub", () => {
    expect(
      getAddressFromXpub(KEY.MAIN.XPUB, 3, 'P2WPKH', 1, 0).address
    ).toBe(KEY.MAIN.CHANGE_3.BECH32)
  })
  test("P2WPKH change address generation key index 3 from ypub", () => {
    expect(
      getAddressFromXpub(KEY.MAIN.YPUB, 3, 'P2WPKH', 1, 0).address
    ).toBe(KEY.MAIN.CHANGE_3.BECH32)
  })
  test("P2WPKH change address generation key index 3 from zpub", () => {
    expect(
      getAddressFromXpub(KEY.MAIN.ZPUB, 3, 'P2WPKH', 1, 0).address
    ).toBe(KEY.MAIN.CHANGE_3.BECH32)
  })
})

describe("getAddressFromXpub defaults to BECH32", () => {
  test("default address generation from xpub on mainnet should be BECH32", () => {
    expect(
      getAddressFromXpub(KEY.MAIN.XPUB).address
    ).toBe(KEY.MAIN.BECH32)
  })
  test("default address generation from ypub on mainnet should be BECH32", () => {
    expect(
      getAddressFromXpub(KEY.MAIN.YPUB).address
    ).toBe(KEY.MAIN.BECH32)
  })
  test("default address generation from zpub on mainnet should be BECH32", () => {
    expect(
      getAddressFromXpub(KEY.MAIN.ZPUB).address
    ).toBe(KEY.MAIN.BECH32)
  })
})

describe("account number has no effect on derived address", () => {
  test("P2PKH address generation from xpub", () => {
    expect(
      getAddressFromXpub(KEY.MAIN.XPUB, 0, 'P2PKH', 0, 1).address
    ).toBe(KEY.MAIN.LEGACY)
  })
  test("P2PKH address generation from xpub", () => {
    expect(
      getAddressFromXpub(KEY.MAIN.XPUB, 0, 'P2PKH', 0, 2).address
    ).toBe(KEY.MAIN.LEGACY)
  })
  test("P2PKH address generation from xpub", () => {
    expect(
      getAddressFromXpub(KEY.MAIN.XPUB, 0, 'P2PKH', 1, 1).address
    ).toBe(KEY.MAIN.CHANGE.LEGACY)
  })
})
