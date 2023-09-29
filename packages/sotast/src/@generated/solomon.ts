/* eslint-disable */
// @generated by protobuf-ts 2.9.1 with parameter optimize_speed,use_proto_field_name
// @generated from protobuf file "solomon.proto" (package "me.sylver.marver.solomon", syntax proto3)
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
import { MESSAGE_TYPE } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
/**
 * @generated from protobuf message me.sylver.marver.solomon.GetImageEmbeddingRequest
 */
export interface GetImageEmbeddingRequest {
    /**
     * @generated from protobuf oneof: input
     */
    input: {
        oneofKind: "file_path";
        /**
         * @generated from protobuf field: string file_path = 4;
         */
        file_path: string;
    } | {
        oneofKind: "text_input";
        /**
         * @generated from protobuf field: string text_input = 5;
         */
        text_input: string;
    } | {
        oneofKind: undefined;
    };
}
/**
 * @generated from protobuf message me.sylver.marver.solomon.GetImageEmbeddingResponse
 */
export interface GetImageEmbeddingResponse {
    /**
     * @generated from protobuf field: me.sylver.marver.solomon.Embedding embedding = 1;
     */
    embedding?: Embedding;
}
/**
 * @generated from protobuf message me.sylver.marver.solomon.DetectFacesRequest
 */
export interface DetectFacesRequest {
    /**
     * @generated from protobuf field: string file_path = 1;
     */
    file_path: string;
}
/**
 * @generated from protobuf message me.sylver.marver.solomon.DetectFacesResponse
 */
export interface DetectFacesResponse {
    /**
     * @generated from protobuf field: repeated me.sylver.marver.solomon.Face faces = 1;
     */
    faces: Face[];
}
/**
 * @generated from protobuf message me.sylver.marver.solomon.Face
 */
export interface Face {
    /**
     * @generated from protobuf field: me.sylver.marver.solomon.BoundingBox bounding_box = 1;
     */
    bounding_box?: BoundingBox;
    /**
     * @generated from protobuf field: me.sylver.marver.solomon.Embedding embedding = 2;
     */
    embedding?: Embedding;
    /**
     * @generated from protobuf field: float confidence = 3;
     */
    confidence: number;
}
/**
 * @generated from protobuf message me.sylver.marver.solomon.BoundingBox
 */
export interface BoundingBox {
    /**
     * @generated from protobuf field: float x1 = 1;
     */
    x1: number;
    /**
     * @generated from protobuf field: float y1 = 2;
     */
    y1: number;
    /**
     * @generated from protobuf field: float x2 = 3;
     */
    x2: number;
    /**
     * @generated from protobuf field: float y2 = 4;
     */
    y2: number;
}
/**
 * @generated from protobuf message me.sylver.marver.solomon.Embedding
 */
export interface Embedding {
    /**
     * @generated from protobuf field: repeated float value = 1;
     */
    value: number[];
}
/**
 * @generated from protobuf message me.sylver.marver.solomon.GetOCRRequest
 */
export interface GetOCRRequest {
    /**
     * @generated from protobuf field: string file_path = 1;
     */
    file_path: string;
}
/**
 * @generated from protobuf message me.sylver.marver.solomon.GetOCRResponse
 */
export interface GetOCRResponse {
    /**
     * @generated from protobuf field: repeated me.sylver.marver.solomon.OCR results = 1;
     */
    results: OCR[];
}
/**
 * @generated from protobuf message me.sylver.marver.solomon.OCR
 */
export interface OCR {
    /**
     * @generated from protobuf field: string text = 1;
     */
    text: string;
    /**
     * @generated from protobuf field: me.sylver.marver.solomon.BoundingBox bounding_box = 2;
     */
    bounding_box?: BoundingBox;
    /**
     * @generated from protobuf field: float confidence = 3;
     */
    confidence: number;
}
// @generated message type with reflection information, may provide speed optimized methods
class GetImageEmbeddingRequest$Type extends MessageType<GetImageEmbeddingRequest> {
    constructor() {
        super("me.sylver.marver.solomon.GetImageEmbeddingRequest", [
            { no: 4, name: "file_path", kind: "scalar", localName: "file_path", oneof: "input", T: 9 /*ScalarType.STRING*/ },
            { no: 5, name: "text_input", kind: "scalar", localName: "text_input", oneof: "input", T: 9 /*ScalarType.STRING*/ }
        ]);
    }
    create(value?: PartialMessage<GetImageEmbeddingRequest>): GetImageEmbeddingRequest {
        const message = { input: { oneofKind: undefined } };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<GetImageEmbeddingRequest>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: GetImageEmbeddingRequest): GetImageEmbeddingRequest {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* string file_path */ 4:
                    message.input = {
                        oneofKind: "file_path",
                        file_path: reader.string()
                    };
                    break;
                case /* string text_input */ 5:
                    message.input = {
                        oneofKind: "text_input",
                        text_input: reader.string()
                    };
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
    internalBinaryWrite(message: GetImageEmbeddingRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* string file_path = 4; */
        if (message.input.oneofKind === "file_path")
            writer.tag(4, WireType.LengthDelimited).string(message.input.file_path);
        /* string text_input = 5; */
        if (message.input.oneofKind === "text_input")
            writer.tag(5, WireType.LengthDelimited).string(message.input.text_input);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message me.sylver.marver.solomon.GetImageEmbeddingRequest
 */
export const GetImageEmbeddingRequest = new GetImageEmbeddingRequest$Type();
// @generated message type with reflection information, may provide speed optimized methods
class GetImageEmbeddingResponse$Type extends MessageType<GetImageEmbeddingResponse> {
    constructor() {
        super("me.sylver.marver.solomon.GetImageEmbeddingResponse", [
            { no: 1, name: "embedding", kind: "message", T: () => Embedding }
        ]);
    }
    create(value?: PartialMessage<GetImageEmbeddingResponse>): GetImageEmbeddingResponse {
        const message = {};
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<GetImageEmbeddingResponse>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: GetImageEmbeddingResponse): GetImageEmbeddingResponse {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* me.sylver.marver.solomon.Embedding embedding */ 1:
                    message.embedding = Embedding.internalBinaryRead(reader, reader.uint32(), options, message.embedding);
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
    internalBinaryWrite(message: GetImageEmbeddingResponse, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* me.sylver.marver.solomon.Embedding embedding = 1; */
        if (message.embedding)
            Embedding.internalBinaryWrite(message.embedding, writer.tag(1, WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message me.sylver.marver.solomon.GetImageEmbeddingResponse
 */
export const GetImageEmbeddingResponse = new GetImageEmbeddingResponse$Type();
// @generated message type with reflection information, may provide speed optimized methods
class DetectFacesRequest$Type extends MessageType<DetectFacesRequest> {
    constructor() {
        super("me.sylver.marver.solomon.DetectFacesRequest", [
            { no: 1, name: "file_path", kind: "scalar", localName: "file_path", T: 9 /*ScalarType.STRING*/ }
        ]);
    }
    create(value?: PartialMessage<DetectFacesRequest>): DetectFacesRequest {
        const message = { file_path: "" };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<DetectFacesRequest>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: DetectFacesRequest): DetectFacesRequest {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* string file_path */ 1:
                    message.file_path = reader.string();
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
    internalBinaryWrite(message: DetectFacesRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* string file_path = 1; */
        if (message.file_path !== "")
            writer.tag(1, WireType.LengthDelimited).string(message.file_path);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message me.sylver.marver.solomon.DetectFacesRequest
 */
export const DetectFacesRequest = new DetectFacesRequest$Type();
// @generated message type with reflection information, may provide speed optimized methods
class DetectFacesResponse$Type extends MessageType<DetectFacesResponse> {
    constructor() {
        super("me.sylver.marver.solomon.DetectFacesResponse", [
            { no: 1, name: "faces", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => Face }
        ]);
    }
    create(value?: PartialMessage<DetectFacesResponse>): DetectFacesResponse {
        const message = { faces: [] };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<DetectFacesResponse>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: DetectFacesResponse): DetectFacesResponse {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* repeated me.sylver.marver.solomon.Face faces */ 1:
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
    internalBinaryWrite(message: DetectFacesResponse, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* repeated me.sylver.marver.solomon.Face faces = 1; */
        for (let i = 0; i < message.faces.length; i++)
            Face.internalBinaryWrite(message.faces[i], writer.tag(1, WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message me.sylver.marver.solomon.DetectFacesResponse
 */
export const DetectFacesResponse = new DetectFacesResponse$Type();
// @generated message type with reflection information, may provide speed optimized methods
class Face$Type extends MessageType<Face> {
    constructor() {
        super("me.sylver.marver.solomon.Face", [
            { no: 1, name: "bounding_box", kind: "message", localName: "bounding_box", T: () => BoundingBox },
            { no: 2, name: "embedding", kind: "message", T: () => Embedding },
            { no: 3, name: "confidence", kind: "scalar", T: 2 /*ScalarType.FLOAT*/ }
        ]);
    }
    create(value?: PartialMessage<Face>): Face {
        const message = { confidence: 0 };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<Face>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: Face): Face {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* me.sylver.marver.solomon.BoundingBox bounding_box */ 1:
                    message.bounding_box = BoundingBox.internalBinaryRead(reader, reader.uint32(), options, message.bounding_box);
                    break;
                case /* me.sylver.marver.solomon.Embedding embedding */ 2:
                    message.embedding = Embedding.internalBinaryRead(reader, reader.uint32(), options, message.embedding);
                    break;
                case /* float confidence */ 3:
                    message.confidence = reader.float();
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
    internalBinaryWrite(message: Face, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* me.sylver.marver.solomon.BoundingBox bounding_box = 1; */
        if (message.bounding_box)
            BoundingBox.internalBinaryWrite(message.bounding_box, writer.tag(1, WireType.LengthDelimited).fork(), options).join();
        /* me.sylver.marver.solomon.Embedding embedding = 2; */
        if (message.embedding)
            Embedding.internalBinaryWrite(message.embedding, writer.tag(2, WireType.LengthDelimited).fork(), options).join();
        /* float confidence = 3; */
        if (message.confidence !== 0)
            writer.tag(3, WireType.Bit32).float(message.confidence);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message me.sylver.marver.solomon.Face
 */
export const Face = new Face$Type();
// @generated message type with reflection information, may provide speed optimized methods
class BoundingBox$Type extends MessageType<BoundingBox> {
    constructor() {
        super("me.sylver.marver.solomon.BoundingBox", [
            { no: 1, name: "x1", kind: "scalar", T: 2 /*ScalarType.FLOAT*/ },
            { no: 2, name: "y1", kind: "scalar", T: 2 /*ScalarType.FLOAT*/ },
            { no: 3, name: "x2", kind: "scalar", T: 2 /*ScalarType.FLOAT*/ },
            { no: 4, name: "y2", kind: "scalar", T: 2 /*ScalarType.FLOAT*/ }
        ]);
    }
    create(value?: PartialMessage<BoundingBox>): BoundingBox {
        const message = { x1: 0, y1: 0, x2: 0, y2: 0 };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<BoundingBox>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: BoundingBox): BoundingBox {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* float x1 */ 1:
                    message.x1 = reader.float();
                    break;
                case /* float y1 */ 2:
                    message.y1 = reader.float();
                    break;
                case /* float x2 */ 3:
                    message.x2 = reader.float();
                    break;
                case /* float y2 */ 4:
                    message.y2 = reader.float();
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
    internalBinaryWrite(message: BoundingBox, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* float x1 = 1; */
        if (message.x1 !== 0)
            writer.tag(1, WireType.Bit32).float(message.x1);
        /* float y1 = 2; */
        if (message.y1 !== 0)
            writer.tag(2, WireType.Bit32).float(message.y1);
        /* float x2 = 3; */
        if (message.x2 !== 0)
            writer.tag(3, WireType.Bit32).float(message.x2);
        /* float y2 = 4; */
        if (message.y2 !== 0)
            writer.tag(4, WireType.Bit32).float(message.y2);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message me.sylver.marver.solomon.BoundingBox
 */
export const BoundingBox = new BoundingBox$Type();
// @generated message type with reflection information, may provide speed optimized methods
class Embedding$Type extends MessageType<Embedding> {
    constructor() {
        super("me.sylver.marver.solomon.Embedding", [
            { no: 1, name: "value", kind: "scalar", repeat: 1 /*RepeatType.PACKED*/, T: 2 /*ScalarType.FLOAT*/ }
        ]);
    }
    create(value?: PartialMessage<Embedding>): Embedding {
        const message = { value: [] };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<Embedding>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: Embedding): Embedding {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* repeated float value */ 1:
                    if (wireType === WireType.LengthDelimited)
                        for (let e = reader.int32() + reader.pos; reader.pos < e;)
                            message.value.push(reader.float());
                    else
                        message.value.push(reader.float());
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
    internalBinaryWrite(message: Embedding, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* repeated float value = 1; */
        if (message.value.length) {
            writer.tag(1, WireType.LengthDelimited).fork();
            for (let i = 0; i < message.value.length; i++)
                writer.float(message.value[i]);
            writer.join();
        }
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message me.sylver.marver.solomon.Embedding
 */
export const Embedding = new Embedding$Type();
// @generated message type with reflection information, may provide speed optimized methods
class GetOCRRequest$Type extends MessageType<GetOCRRequest> {
    constructor() {
        super("me.sylver.marver.solomon.GetOCRRequest", [
            { no: 1, name: "file_path", kind: "scalar", localName: "file_path", T: 9 /*ScalarType.STRING*/ }
        ]);
    }
    create(value?: PartialMessage<GetOCRRequest>): GetOCRRequest {
        const message = { file_path: "" };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<GetOCRRequest>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: GetOCRRequest): GetOCRRequest {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* string file_path */ 1:
                    message.file_path = reader.string();
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
    internalBinaryWrite(message: GetOCRRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* string file_path = 1; */
        if (message.file_path !== "")
            writer.tag(1, WireType.LengthDelimited).string(message.file_path);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message me.sylver.marver.solomon.GetOCRRequest
 */
export const GetOCRRequest = new GetOCRRequest$Type();
// @generated message type with reflection information, may provide speed optimized methods
class GetOCRResponse$Type extends MessageType<GetOCRResponse> {
    constructor() {
        super("me.sylver.marver.solomon.GetOCRResponse", [
            { no: 1, name: "results", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => OCR }
        ]);
    }
    create(value?: PartialMessage<GetOCRResponse>): GetOCRResponse {
        const message = { results: [] };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<GetOCRResponse>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: GetOCRResponse): GetOCRResponse {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* repeated me.sylver.marver.solomon.OCR results */ 1:
                    message.results.push(OCR.internalBinaryRead(reader, reader.uint32(), options));
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
    internalBinaryWrite(message: GetOCRResponse, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* repeated me.sylver.marver.solomon.OCR results = 1; */
        for (let i = 0; i < message.results.length; i++)
            OCR.internalBinaryWrite(message.results[i], writer.tag(1, WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message me.sylver.marver.solomon.GetOCRResponse
 */
export const GetOCRResponse = new GetOCRResponse$Type();
// @generated message type with reflection information, may provide speed optimized methods
class OCR$Type extends MessageType<OCR> {
    constructor() {
        super("me.sylver.marver.solomon.OCR", [
            { no: 1, name: "text", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "bounding_box", kind: "message", localName: "bounding_box", T: () => BoundingBox },
            { no: 3, name: "confidence", kind: "scalar", T: 2 /*ScalarType.FLOAT*/ }
        ]);
    }
    create(value?: PartialMessage<OCR>): OCR {
        const message = { text: "", confidence: 0 };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<OCR>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: OCR): OCR {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* string text */ 1:
                    message.text = reader.string();
                    break;
                case /* me.sylver.marver.solomon.BoundingBox bounding_box */ 2:
                    message.bounding_box = BoundingBox.internalBinaryRead(reader, reader.uint32(), options, message.bounding_box);
                    break;
                case /* float confidence */ 3:
                    message.confidence = reader.float();
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
    internalBinaryWrite(message: OCR, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* string text = 1; */
        if (message.text !== "")
            writer.tag(1, WireType.LengthDelimited).string(message.text);
        /* me.sylver.marver.solomon.BoundingBox bounding_box = 2; */
        if (message.bounding_box)
            BoundingBox.internalBinaryWrite(message.bounding_box, writer.tag(2, WireType.LengthDelimited).fork(), options).join();
        /* float confidence = 3; */
        if (message.confidence !== 0)
            writer.tag(3, WireType.Bit32).float(message.confidence);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message me.sylver.marver.solomon.OCR
 */
export const OCR = new OCR$Type();
/**
 * @generated ServiceType for protobuf service me.sylver.marver.solomon.SolomonService
 */
export const SolomonService = new ServiceType("me.sylver.marver.solomon.SolomonService", [
    { name: "GetImageEmbedding", options: {}, I: GetImageEmbeddingRequest, O: GetImageEmbeddingResponse },
    { name: "DetectFaces", options: {}, I: DetectFacesRequest, O: DetectFacesResponse },
    { name: "GetOCR", options: {}, I: GetOCRRequest, O: GetOCRResponse }
]);