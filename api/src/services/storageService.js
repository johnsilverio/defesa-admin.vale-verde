"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFile = uploadFile;
exports.getFileUrl = getFileUrl;
exports.deleteFile = deleteFile;
const supabaseService_1 = require("./supabaseService");
const bucket = process.env.SUPABASE_BUCKET;
function uploadFile(path, fileBuffer, contentType) {
    return __awaiter(this, void 0, void 0, function* () {
        const { data, error } = yield supabaseService_1.supabase.storage.from(bucket).upload(path, fileBuffer, {
            contentType,
            upsert: true,
        });
        if (error)
            throw error;
        return data;
    });
}
function getFileUrl(path) {
    return __awaiter(this, void 0, void 0, function* () {
        const { data, error } = yield supabaseService_1.supabase.storage.from(bucket).createSignedUrl(path, 60 * 60); // 1h
        if (error)
            throw error;
        return data.signedUrl;
    });
}
function deleteFile(path) {
    return __awaiter(this, void 0, void 0, function* () {
        const { error } = yield supabaseService_1.supabase.storage.from(bucket).remove([path]);
        if (error)
            throw error;
    });
}
