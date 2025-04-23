"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Document = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const documentSchema = new mongoose_1.default.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    fileName: { type: String, required: true, trim: true },
    originalFileName: { type: String, required: true, trim: true },
    fileSize: { type: Number, required: true },
    fileType: { type: String, required: true, trim: true },
    filePath: { type: String, required: true, trim: true },
    category: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Category', required: true },
    property: { type: String, required: true, trim: true },
    uploadedBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    isHighlighted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});
documentSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});
exports.Document = mongoose_1.default.model('Document', documentSchema);
