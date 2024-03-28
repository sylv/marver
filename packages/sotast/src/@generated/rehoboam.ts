
// @generated by protobuf-ts 2.9.3 with parameter optimize_speed,use_proto_field_name
// @generated from protobuf file "rehoboam.proto" (package "me.sylver.marver.rehoboam", syntax proto3)
// tslint:disable
import { ServiceType } from "@protobuf-ts/runtime-rpc";
import type { BinaryWriteOptions } from "@protobuf-ts/runtime";
import type { IBinaryWriter } from "@protobuf-ts/runtime";
import { WireType } from "@protobuf-ts/runtime";
import type { BinaryReadOptions } from "@protobuf-ts/runtime";
import type { IBinaryReader } from "@protobuf-ts/runtime";
import { UnknownFieldHandler } from "@protobuf-ts/runtime";
import type { PartialMessage } from "@protobuf-ts/runtime";
import { reflectionMergePartial } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
import { Face } from "./core.js";
import { Embedding } from "./core.js";
import { Subtitle } from "./core.js";
/**
 * @generated from protobuf message me.sylver.marver.rehoboam.ExtractSubtitlesRequest
 */
export interface ExtractSubtitlesRequest {
    /**
     * @generated from protobuf field: bytes audio = 1;
     */
    audio: Uint8Array;
}
/**
 * @generated from protobuf message me.sylver.marver.rehoboam.ExtractSubtitlesReply
 */
export interface ExtractSubtitlesReply {
    /**
     * @generated from protobuf field: repeated me.sylver.marver.core.Subtitle subtitles = 1;
     */
    subtitles: Subtitle[];
}
/**
 * @generated from protobuf message me.sylver.marver.rehoboam.EncodeImageRequest
 */
export interface EncodeImageRequest {
    /**
     * @generated from protobuf field: repeated bytes images = 1;
     */
    images: Uint8Array[];
}
/**
 * @generated from protobuf message me.sylver.marver.rehoboam.EncodeImageReply
 */
export interface EncodeImageReply {
    /**
     * @generated from protobuf field: repeated me.sylver.marver.core.Embedding embeddings = 1;
     */
    embeddings: Embedding[];
}
/**
 * @generated from protobuf message me.sylver.marver.rehoboam.EncodeTextRequest
 */
export interface EncodeTextRequest {
    /**
     * @generated from protobuf field: repeated string texts = 1;
     */
    texts: string[];
}
/**
 * @generated from protobuf message me.sylver.marver.rehoboam.EncodeTextReply
 */
export interface EncodeTextReply {
    /**
     * @generated from protobuf field: repeated me.sylver.marver.core.Embedding embeddings = 1;
     */
    embeddings: Embedding[];
}
/**
 * @generated from protobuf message me.sylver.marver.rehoboam.ExtractFacesRequest
 */
export interface ExtractFacesRequest {
    /**
     * @generated from protobuf field: repeated bytes images = 1;
     */
    images: Uint8Array[];
}
/**
 * @generated from protobuf message me.sylver.marver.rehoboam.ExtractFacesReply
 */
export interface ExtractFacesReply {
    /**
     * @generated from protobuf field: repeated me.sylver.marver.core.Face faces = 1;
     */
    faces: Face[];
}
// @generated message type with reflection information, may provide speed optimized methods
class ExtractSubtitlesRequest$Type extends MessageType<ExtractSubtitlesRequest> {
    constructor() {
        super("me.sylver.marver.rehoboam.ExtractSubtitlesRequest", [
            { no: 1, name: "audio", kind: "scalar", T: 12 /*ScalarType.BYTES*/ }
        ]);
    }
    create(value?: PartialMessage<ExtractSubtitlesRequest>): ExtractSubtitlesRequest {
        const message = globalThis.Object.create((this.messagePrototype!));
        message.audio = new Uint8Array(0);
        if (value !== undefined)
            reflectionMergePartial<ExtractSubtitlesRequest>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: ExtractSubtitlesRequest): ExtractSubtitlesRequest {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* bytes audio */ 1:
                    message.audio = reader.bytes();
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message: ExtractSubtitlesRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* bytes audio = 1; */
        if (message.audio.length)
            writer.tag(1, WireType.LengthDelimited).bytes(message.audio);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message me.sylver.marver.rehoboam.ExtractSubtitlesRequest
 */
export const ExtractSubtitlesRequest = new ExtractSubtitlesRequest$Type();
// @generated message type with reflection information, may provide speed optimized methods
class ExtractSubtitlesReply$Type extends MessageType<ExtractSubtitlesReply> {
    constructor() {
        super("me.sylver.marver.rehoboam.ExtractSubtitlesReply", [
            { no: 1, name: "subtitles", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => Subtitle }
        ]);
    }
    create(value?: PartialMessage<ExtractSubtitlesReply>): ExtractSubtitlesReply {
        const message = globalThis.Object.create((this.messagePrototype!));
        message.subtitles = [];
        if (value !== undefined)
            reflectionMergePartial<ExtractSubtitlesReply>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: ExtractSubtitlesReply): ExtractSubtitlesReply {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* repeated me.sylver.marver.core.Subtitle subtitles */ 1:
                    message.subtitles.push(Subtitle.internalBinaryRead(reader, reader.uint32(), options));
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message: ExtractSubtitlesReply, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* repeated me.sylver.marver.core.Subtitle subtitles = 1; */
        for (let i = 0; i < message.subtitles.length; i++)
            Subtitle.internalBinaryWrite(message.subtitles[i], writer.tag(1, WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message me.sylver.marver.rehoboam.ExtractSubtitlesReply
 */
export const ExtractSubtitlesReply = new ExtractSubtitlesReply$Type();
// @generated message type with reflection information, may provide speed optimized methods
class EncodeImageRequest$Type extends MessageType<EncodeImageRequest> {
    constructor() {
        super("me.sylver.marver.rehoboam.EncodeImageRequest", [
            { no: 1, name: "images", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 12 /*ScalarType.BYTES*/ }
        ]);
    }
    create(value?: PartialMessage<EncodeImageRequest>): EncodeImageRequest {
        const message = globalThis.Object.create((this.messagePrototype!));
        message.images = [];
        if (value !== undefined)
            reflectionMergePartial<EncodeImageRequest>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: EncodeImageRequest): EncodeImageRequest {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* repeated bytes images */ 1:
                    message.images.push(reader.bytes());
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message: EncodeImageRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* repeated bytes images = 1; */
        for (let i = 0; i < message.images.length; i++)
            writer.tag(1, WireType.LengthDelimited).bytes(message.images[i]);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message me.sylver.marver.rehoboam.EncodeImageRequest
 */
export const EncodeImageRequest = new EncodeImageRequest$Type();
// @generated message type with reflection information, may provide speed optimized methods
class EncodeImageReply$Type extends MessageType<EncodeImageReply> {
    constructor() {
        super("me.sylver.marver.rehoboam.EncodeImageReply", [
            { no: 1, name: "embeddings", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => Embedding }
        ]);
    }
    create(value?: PartialMessage<EncodeImageReply>): EncodeImageReply {
        const message = globalThis.Object.create((this.messagePrototype!));
        message.embeddings = [];
        if (value !== undefined)
            reflectionMergePartial<EncodeImageReply>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: EncodeImageReply): EncodeImageReply {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* repeated me.sylver.marver.core.Embedding embeddings */ 1:
                    message.embeddings.push(Embedding.internalBinaryRead(reader, reader.uint32(), options));
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message: EncodeImageReply, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* repeated me.sylver.marver.core.Embedding embeddings = 1; */
        for (let i = 0; i < message.embeddings.length; i++)
            Embedding.internalBinaryWrite(message.embeddings[i], writer.tag(1, WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message me.sylver.marver.rehoboam.EncodeImageReply
 */
export const EncodeImageReply = new EncodeImageReply$Type();
// @generated message type with reflection information, may provide speed optimized methods
class EncodeTextRequest$Type extends MessageType<EncodeTextRequest> {
    constructor() {
        super("me.sylver.marver.rehoboam.EncodeTextRequest", [
            { no: 1, name: "texts", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ }
        ]);
    }
    create(value?: PartialMessage<EncodeTextRequest>): EncodeTextRequest {
        const message = globalThis.Object.create((this.messagePrototype!));
        message.texts = [];
        if (value !== undefined)
            reflectionMergePartial<EncodeTextRequest>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: EncodeTextRequest): EncodeTextRequest {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* repeated string texts */ 1:
                    message.texts.push(reader.string());
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message: EncodeTextRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* repeated string texts = 1; */
        for (let i = 0; i < message.texts.length; i++)
            writer.tag(1, WireType.LengthDelimited).string(message.texts[i]);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message me.sylver.marver.rehoboam.EncodeTextRequest
 */
export const EncodeTextRequest = new EncodeTextRequest$Type();
// @generated message type with reflection information, may provide speed optimized methods
class EncodeTextReply$Type extends MessageType<EncodeTextReply> {
    constructor() {
        super("me.sylver.marver.rehoboam.EncodeTextReply", [
            { no: 1, name: "embeddings", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => Embedding }
        ]);
    }
    create(value?: PartialMessage<EncodeTextReply>): EncodeTextReply {
        const message = globalThis.Object.create((this.messagePrototype!));
        message.embeddings = [];
        if (value !== undefined)
            reflectionMergePartial<EncodeTextReply>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: EncodeTextReply): EncodeTextReply {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* repeated me.sylver.marver.core.Embedding embeddings */ 1:
                    message.embeddings.push(Embedding.internalBinaryRead(reader, reader.uint32(), options));
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message: EncodeTextReply, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* repeated me.sylver.marver.core.Embedding embeddings = 1; */
        for (let i = 0; i < message.embeddings.length; i++)
            Embedding.internalBinaryWrite(message.embeddings[i], writer.tag(1, WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message me.sylver.marver.rehoboam.EncodeTextReply
 */
export const EncodeTextReply = new EncodeTextReply$Type();
// @generated message type with reflection information, may provide speed optimized methods
class ExtractFacesRequest$Type extends MessageType<ExtractFacesRequest> {
    constructor() {
        super("me.sylver.marver.rehoboam.ExtractFacesRequest", [
            { no: 1, name: "images", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 12 /*ScalarType.BYTES*/ }
        ]);
    }
    create(value?: PartialMessage<ExtractFacesRequest>): ExtractFacesRequest {
        const message = globalThis.Object.create((this.messagePrototype!));
        message.images = [];
        if (value !== undefined)
            reflectionMergePartial<ExtractFacesRequest>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: ExtractFacesRequest): ExtractFacesRequest {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* repeated bytes images */ 1:
                    message.images.push(reader.bytes());
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message: ExtractFacesRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* repeated bytes images = 1; */
        for (let i = 0; i < message.images.length; i++)
            writer.tag(1, WireType.LengthDelimited).bytes(message.images[i]);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message me.sylver.marver.rehoboam.ExtractFacesRequest
 */
export const ExtractFacesRequest = new ExtractFacesRequest$Type();
// @generated message type with reflection information, may provide speed optimized methods
class ExtractFacesReply$Type extends MessageType<ExtractFacesReply> {
    constructor() {
        super("me.sylver.marver.rehoboam.ExtractFacesReply", [
            { no: 1, name: "faces", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => Face }
        ]);
    }
    create(value?: PartialMessage<ExtractFacesReply>): ExtractFacesReply {
        const message = globalThis.Object.create((this.messagePrototype!));
        message.faces = [];
        if (value !== undefined)
            reflectionMergePartial<ExtractFacesReply>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: ExtractFacesReply): ExtractFacesReply {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* repeated me.sylver.marver.core.Face faces */ 1:
                    message.faces.push(Face.internalBinaryRead(reader, reader.uint32(), options));
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message: ExtractFacesReply, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* repeated me.sylver.marver.core.Face faces = 1; */
        for (let i = 0; i < message.faces.length; i++)
            Face.internalBinaryWrite(message.faces[i], writer.tag(1, WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message me.sylver.marver.rehoboam.ExtractFacesReply
 */
export const ExtractFacesReply = new ExtractFacesReply$Type();
/**
 * @generated ServiceType for protobuf service me.sylver.marver.rehoboam.RehoboamService
 */
export const RehoboamService = new ServiceType("me.sylver.marver.rehoboam.RehoboamService", [
    { name: "EncodeImage", options: {}, I: EncodeImageRequest, O: EncodeImageReply },
    { name: "EncodeText", options: {}, I: EncodeTextRequest, O: EncodeTextReply },
    { name: "ExtractFaces", options: {}, I: ExtractFacesRequest, O: ExtractFacesReply },
    { name: "ExtractSubtitles", options: {}, I: ExtractSubtitlesRequest, O: ExtractSubtitlesReply }
]);
