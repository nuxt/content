import type { Draft07 } from '../../types'

export const infoStandardSchema: Draft07 = {
  $ref: '#/definitions/info',
  definitions: {
    info: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
        },
        version: {
          type: 'string',
        },
        structureVersion: {
          type: 'string',
        },
        ready: {
          type: 'boolean',
        },
      },
      required: [
        'id',
        'version',
        'structureVersion',
        'ready',
      ],
      additionalProperties: false,
    },
  },
  $schema: 'http://json-schema.org/draft-07/schema#',
}

export const emptyStandardSchema: Draft07 = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $ref: '#/definitions/__SCHEMA__',
  definitions: {
    __SCHEMA__: {
      type: 'object',
      properties: {},
      required: [],
      additionalProperties: false,
    },
  },
}

export const metaStandardSchema: Draft07 = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $ref: '#/definitions/__SCHEMA__',
  definitions: {
    __SCHEMA__: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
        },
        stem: {
          type: 'string',
        },
        extension: {
          type: 'string',
          enum: [
            'md',
            'yaml',
            'yml',
            'json',
            'csv',
            'xml',
          ],
        },
        meta: {
          type: 'object',
          additionalProperties: {},
        },
      },
      required: [
        'id',
        'stem',
        'extension',
        'meta',
      ],
      additionalProperties: false,
    },
  },
}

export const pageStandardSchema: Draft07 = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $ref: '#/definitions/__SCHEMA__',
  definitions: {
    __SCHEMA__: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
        },
        title: {
          type: 'string',
        },
        description: {
          type: 'string',
        },
        seo: {
          allOf: [
            {
              type: 'object',
              properties: {
                title: {
                  type: 'string',
                },
                description: {
                  type: 'string',
                },
              },
            },
            {
              type: 'object',
              additionalProperties: {},
            },
          ],
          default: {},
        },
        body: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
            },
            children: {},
            toc: {},
          },
          required: [
            'type',
          ],
          additionalProperties: false,
        },
        navigation: {
          anyOf: [
            {
              type: 'boolean',
            },
            {
              type: 'object',
              properties: {
                title: {
                  type: 'string',
                },
                description: {
                  type: 'string',
                },
                icon: {
                  type: 'string',
                  $content: {
                    editor: {
                      input: 'icon',
                    },
                  },
                },
              },
              required: [
                'title',
                'description',
                'icon',
              ],
              additionalProperties: false,
            },
          ],
          default: true,
        },
      },
      required: [
        'path',
        'title',
        'description',
        'body',
      ],
      additionalProperties: false,
    },
  },
}
