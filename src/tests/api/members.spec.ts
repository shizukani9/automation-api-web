// src/tests/api/members.spec.ts
import { test, expect } from '@playwright/test';
import { Actor } from '../../actors/Actor';
import { CallAnApi } from '../../actors/abilities/CallAnApi';
import { GetMemberById } from '../../tasks/api/GetMemberById';
import { CreateMember } from '../../tasks/api/CreateMember';
import { UpdateMember } from '../../tasks/api/UpdateMember';
import { ValidateResponse } from '../../interactions/api/ValidateResponse';
import { ResponseCode } from '../../questions/api/ResponseCode';
import { ResponseBody } from '../../questions/api/ResponseBody';
import { MemberSchema } from '../../models/schemas/MemberSchema';
import { RandomMember } from '../../questions/api/RandomMember';
import { TestDataGenerator } from '../../fixtures/testData';
import { WaitForApi } from '../../interactions/api/WaitForApi';

// 🔄 Configurar retries para TODO el describe
test.describe.configure({ 
  mode: 'serial',
  retries: 3 // ✅ 3 reintentos para todos los tests
});

test.describe('TC-API: Members API', () => {
  let actor: Actor;
  const baseURL = 'http://localhost:5002';

  test.beforeEach(async ({ request }) => {
    actor = Actor.called('Tester');
    actor.can(CallAnApi.as(request, baseURL));
    
    console.log('⏳ Esperando 20 segundos para evitar rate limit...');
    await WaitForApi.seconds(20).performAs(actor);
  });

  // ============================================================
  // TC-API-001: GET /api/members/:id - Obtener miembro existente
  // ============================================================
  test('TC-API-001: Get existing member by ID - @smoke @positive @EP', async () => {
    const memberId = 1;

    const response = await actor.attemptsTo(
      GetMemberById.withId(memberId)
    );

    await ValidateResponse.of(response)
      .withStatusCode(200)
      .withSchema(MemberSchema)
      .performAs(actor);

    const body = await ResponseBody.of(response).answeredBy(actor);
    expect(body.id).toBe(memberId);
  });

  // ============================================================
  // TC-API-002: GET /api/members/:id - Obtener miembro inexistente
  // ============================================================
  test('TC-API-002: Get non-existing member by ID - @negative @BVA', async () => {
    const memberId = 9999;

    const response = await actor.attemptsTo(
      GetMemberById.withId(memberId)
    );

    const statusCode = await ResponseCode.of(response).answeredBy(actor);
    expect(statusCode).toBe(404);

    const body = await ResponseBody.of(response).answeredBy(actor);
    expect(body.msg).toBe(`Member with id ${memberId} doesn't exist`);
  });

  // ============================================================
  // TC-API-003: POST /api/members - Crear miembro con datos válidos
  // ============================================================
  test('TC-API-003: Create member with valid data - @smoke @positive @EP', async () => {
    const memberData = {
      name: TestDataGenerator.getValidName(),
      gender: TestDataGenerator.getValidGender()
    };

    console.log(`📝 Creando miembro: ${JSON.stringify(memberData)}`);

    const response = await actor.attemptsTo(
      CreateMember.withData(memberData)
    );

    if (response.status() !== 201) {
      const errorBody = await ResponseBody.of(response).answeredBy(actor);
      console.log(`❌ Error ${response.status()}: ${JSON.stringify(errorBody)}`);
    }

    await ValidateResponse.of(response)
      .withStatusCode(201)
      .withBodyContains(memberData)
      .withSchema(MemberSchema)
      .performAs(actor);

    const body = await ResponseBody.of(response).answeredBy(actor);
    expect(body.id).toBeDefined();
    expect(typeof body.id).toBe('number');

    actor.remember('createdMemberId', body.id);
  });

  // ============================================================
  // TC-API-004: POST /api/members - Intentar crear con datos inválidos
  // ============================================================
  test('TC-API-004: Create member with invalid data - @negative @EP @BVA', async () => {
    const invalidData = {
      name: '',
      gender: 'Invalid'
    };

    const response = await actor.attemptsTo(
      CreateMember.withData(invalidData)
    );

    const statusCode = await ResponseCode.of(response).answeredBy(actor);
    expect(statusCode).toBe(400);

    const body = await ResponseBody.of(response).answeredBy(actor);
    expect(body.msg).toBe('Please provide only name and gender');
  });

  // ============================================================
  // TC-API-005: PUT /api/members/:id - Actualizar miembro existente
  // ============================================================
  test('TC-API-005: Update existing member - @smoke @positive @EP', async () => {
    // ⏱️ Esperar 20 segundos para rate limit inicial
    console.log('⏳ Esperando 20s para rate limit...');
    await WaitForApi.seconds(20).performAs(actor);

    // 🔍 1. Obtener un miembro aleatorio existente
    console.log('📡 Obteniendo miembro aleatorio...');
    const randomMember = await RandomMember.fromAPI(actor);
    const memberId = randomMember.id;
    
    console.log(`🔄 Miembro ID ${memberId}: "${randomMember.name}" (${randomMember.gender})`);

    // 📝 2. Datos de actualización
    const updateData = {
      name: TestDataGenerator.getValidName(),
      gender: randomMember.gender === 'Male' ? 'Female' : 'Male'
    };

    console.log(`📝 Actualizando con: ${JSON.stringify(updateData)}`);

    // ✏️ 3. Actualizar el miembro (Petición 1)
    const response = await actor.attemptsTo(
      UpdateMember.withId(memberId, updateData)
    );

    const statusCode = response.status();
    console.log(`📊 Status PUT: ${statusCode}`);
    
    if (statusCode === 400) {
      const errorBody = await ResponseBody.of(response).answeredBy(actor);
      console.log(`❌ Error 400: ${JSON.stringify(errorBody)}`);
      throw new Error(`Error 400: ${errorBody.msg}`);
    }

    await ValidateResponse.of(response)
      .withStatusCode(200)
      .performAs(actor);

    // ⏳ ⏰ ESPERAR 20 SEGUNDOS ANTES DE VERIFICAR
    // Porque el GET cuenta como otra petición y el rate limit es 2 cada 20 segundos
    console.log('⏳ Esperando 20s antes de verificar...');
    await WaitForApi.seconds(20).performAs(actor);

    // 📋 4. Verificar cambios con GET (Petición 2 - después de 20 segundos)
    console.log('📡 Verificando cambios con GET...');
    const getResponse = await actor.attemptsTo(
      GetMemberById.withId(memberId)
    );
    
    console.log(`📊 GET Status: ${getResponse.status()}`);
    
    // Si aún así da 429, esperar más
    if (getResponse.status() === 429) {
      console.log('⏳ Aún rate limit, esperando 20s más...');
      await WaitForApi.seconds(20).performAs(actor);
      
      // Reintentar GET
      const retryGetResponse = await actor.attemptsTo(
        GetMemberById.withId(memberId)
      );
      
      if (retryGetResponse.status() === 429) {
        throw new Error('❌ Rate limit persistente después de esperar');
      }
      
      const retryGetBody = await ResponseBody.of(retryGetResponse).answeredBy(actor);
      console.log(`📋 Respuesta GET: ${JSON.stringify(retryGetBody)}`);
      
      expect(retryGetBody).toHaveProperty('id', memberId);
      expect(retryGetBody).toHaveProperty('name', updateData.name);
      expect(retryGetBody).toHaveProperty('gender', updateData.gender);
      
      console.log(`✅ Miembro actualizado: ID ${memberId}, Nombre: "${retryGetBody.name}"`);
      return;
    }
    
    const getBody = await ResponseBody.of(getResponse).answeredBy(actor);
    console.log(`📋 Respuesta GET: ${JSON.stringify(getBody)}`);
    
    expect(getBody).toHaveProperty('id', memberId);
    expect(getBody).toHaveProperty('name', updateData.name);
    expect(getBody).toHaveProperty('gender', updateData.gender);
    
    console.log(`✅ Miembro actualizado: ID ${memberId}, Nombre: "${getBody.name}"`);
  });
});