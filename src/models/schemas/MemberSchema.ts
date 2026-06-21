// src/models/schemas/MemberSchema.ts
export const MemberSchema = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    name: { type: 'string', minLength: 4, maxLength: 25 },
    gender: { type: 'string', enum: ['Male', 'Female'] },
  },
  required: ['id', 'name', 'gender'],
  additionalProperties: false,
};