import axios from 'axios'
import fs from 'fs'
import OpenAPISnippet from 'openapi-snippet'
import { resolve } from 'path'
import prettier from 'prettier'
import { promisify } from 'util'

const writeFile = promisify(fs.writeFile)

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
// define input:
axios
  .get('http://localhost:3000/swagger-json')
  .then((openApiResponse) => {
    if (!(typeof openApiResponse.data === 'object' && openApiResponse.data !== null && openApiResponse.data.openapi)) {
      console.error("Invalid OpenApi document found on 'http://localhost:3000/swagger-json'")
      console.error(`DuckyApi needs to be running without duckypanel enabled to generate documentation`)
      process.exit(1)
    }

    const targets = [
      'shell_curl',
      'node_native',
      'javascript_xhr',
      'python_python3',
      'php_curl',
      'java_unirest',
      'csharp_restsharp',
      'c_libcurl',
    ]

    const enrichedSchema = enrichSchema(openApiResponse.data, targets)

    const prettySchema = prettier.format(JSON.stringify(enrichedSchema), { parser: 'json' })
    writeFile(resolve('docs/openapi.json'), prettySchema)
  })
  .catch((error) => {
    console.error(
      `Error connecting to 'http://localhost:3000/swagger-json': ${
        error.response ? JSON.stringify(error.response.data) : error.code
      }`,
    )
    console.error(`DuckyApi needs to be running (without a baseurl) to generate documentation`)
    process.exit(1)
  })
