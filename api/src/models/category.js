"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Category = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const categorySchema = new mongoose_1.default.Schema({
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, trim: true },
    property: { type: String, required: true, trim: true },
    order: { type: Number, default: 9999 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});
// Índice composto para garantir unicidade de slug por propriedade
categorySchema.index({ property: 1, slug: 1 }, { unique: true });
categorySchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});
exports.Category = mongoose_1.default.model('Category', categorySchema);
