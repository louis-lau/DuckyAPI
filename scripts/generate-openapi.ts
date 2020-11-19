import { NestFactory } from '@nestjs/core'
import { SwaggerModule } from '@nestjs/swagger'
import { writeFileSync } from 'fs'
import { safeDump as safeDumpYaml } from 'js-yaml'
import OpenAPISnippet from 'openapi-snippet'
import { resolve } from 'path'
import { AppModule } from 'src/app.module'
import { openapiOptions } from 'src/openapi-options'

const enrichSchema = (schema, targets): any => {
  schema.servers = [
    {
      url: 'http://localhost:3000',
    },
  ]
  for (const path in schema.paths) {
    for (const method in schema.paths[path]) {
      const generatedCode = OpenAPISnippet.getEndpointSnippets(schema, path, method, targets)
      schema.paths[path][method]['x-code-samples'] = []
      for (const snippetIdx in generatedCode.snippets) {
        const snippet = generatedCode.snippets[snippetIdx]
        let lang: string
        let label: string
        switch (snippet.id) {
          case 'shell_curl':
            lang = 'Shell'
            label = 'Curl'
            break
          case 'node_native':
            lang = 'JavaScript'
            label = 'Node.js'
            break
          case 'javascript_xhr':
            lang = 'JavaScript'
            label = 'JavaScript'
            break
          case 'python_python3':
            lang = 'Python'
            label = 'Python3'
            break
          case 'php_curl':
            lang = 'PHP'
            label = 'PHP'
            break
          case 'java_unirest':
            lang = 'Java'
            label = 'Java'
            break
          case 'csharp_restsharp':
            lang = 'C#'
            label = 'C#'
            break
          case 'c_libcurl':
            lang = 'C'
            label = 'C'
            break

          default:
            lang = snippet.title
            label = snippet.title
            break
        }
        schema.paths[path][method]['x-code-samples'][snippetIdx] = {
          lang: lang,
          label: label,
          source: snippet.content,
        }
      }
    }
  }
  return schema
}

const main = async () => {
  const app = await NestFactory.create(AppModule)
  const document = SwaggerModule.createDocument(app, openapiOptions)
  app.close()

  const targets = [
    'shell_curl',
    // 'node_native',
    // 'javascript_xhr',
    // 'python_python3',
    // 'php_curl',
    // 'java_unirest',
    // 'csharp_restsharp',
    // 'c_libcurl',
  ]

  const enrichedSchema = enrichSchema(document, targets)

  const yamlSchema = safeDumpYaml(enrichedSchema, { skipInvalid: true })
  writeFileSync(resolve('docs/openapi.yml'), yamlSchema)

  process.exit(0)
}

main()
