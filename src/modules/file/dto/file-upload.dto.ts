import { ObjectType, Field, InputType } from '@nestjs/graphql';
import GraphQLUpload, {
  FileUpload as ApolloFileUpload,
} from 'graphql-upload/GraphQLUpload.mjs';
// ⚠️ Importante: en GraphQL no se puede exponer directamente un Stream,
// pero podés definir un tipo que lo represente lógicamente (por ejemplo un string o Upload).

// Si usás Apollo Server con graphql-upload, el tipo real sería "Upload"
// import { GraphQLUpload, FileUpload as ApolloFileUpload } from 'graphql-upload';

// /

// Clase equivalente a FileUploadCreateReadStreamOptions
@InputType('FileUploadCreateReadStreamOptions')
export class FileUploadCreateReadStreamOptions {
  @Field({ nullable: true })
  encoding?: string;

  @Field({ nullable: true })
  highWaterMark?: number;
}

// Clase equivalente a FileUpload
// (Esta clase normalmente se usa para representar un archivo subido)
@ObjectType('FileUpload')
export class FileUpload {
  @Field()
  filename: string;

  @Field()
  mimetype: string;

  @Field()
  encoding: string;

  // Este campo no se serializa a GraphQL, se usa internamente.
  // GraphQL no puede serializar funciones ni streams.
  createReadStream: ApolloFileUpload['createReadStream'];
}

/**
 
Clase de entrada si querés permitir subir un archivo como InputType
(ejemplo: Mutation uploadFile(file: Upload!))*/
@InputType('UploadInput')
export class UploadInput {
  // GraphQLUpload es el tipo especial que Apollo usa para manejar archivos
  @Field(() => GraphQLUpload, { nullable: true })
  file?: ApolloFileUpload;
}

@InputType('UploadInputArray')
export class UploadInputArray {
  // GraphQLUpload es el tipo especial que Apollo usa para manejar archivos
  @Field(() => GraphQLUpload, { nullable: true })
  files?: Promise<ApolloFileUpload>[];
}
