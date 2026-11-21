// Serialização padrão dos documentos: expõe "id" em vez de "_id"
// e remove campos internos do Mongoose nas respostas da API.
export const jsonOptions = {
  versionKey: false,
  virtuals: true,
  transform(_doc, ret) {
    delete ret._id;
    return ret;
  },
};
