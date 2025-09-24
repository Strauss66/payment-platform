export class PacError extends Error {
  constructor(code, message, meta) {
    super(message);
    this.code = code;
    this.meta = meta;
  }
}

export class PacAdapter {
  // Implementations should override
  async stamp(cfdiXmlOrJson) {
    throw new PacError('NOT_IMPLEMENTED', 'stamp not implemented');
  }

  async cancel({ uuid, rfcEmisor, rfcReceptor, total, motivo, folioSustitucion }) {
    throw new PacError('NOT_IMPLEMENTED', 'cancel not implemented');
  }
}

export default { PacAdapter, PacError };


