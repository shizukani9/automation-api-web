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
import { GetAllMembers } from '../../tasks/api/GetAllMembers';
import { DeleteMember } from '../../tasks/api/DeleteMember';

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
    // ⏳ ESPERA 1: Antes de obtener miembro aleatorio
    console.log('⏳ [Espera 1/3] Esperando 20s para rate limit...');
    await WaitForApi.seconds(20).performAs(actor);

    // 🔍 1. Obtener un miembro aleatorio existente (Petición 1)
    console.log('📡 [Petición 1] Obteniendo miembro aleatorio...');
    const randomMember = await RandomMember.fromAPI(actor);
    const memberId = randomMember.id;
    
    console.log(`🔄 Miembro ID ${memberId}: "${randomMember.name}" (${randomMember.gender})`);

    // 📝 2. Datos de actualización
    const updateData = {
      name: TestDataGenerator.getValidName(),
      gender: randomMember.gender === 'Male' ? 'Female' : 'Male'
    };

    console.log(`📝 Actualizando con: ${JSON.stringify(updateData)}`);

    // ⏳ ESPERA 2: Antes de actualizar (después del GET)
    console.log('⏳ [Espera 2/3] Esperando 20s antes de actualizar...');
    await WaitForApi.seconds(20).performAs(actor);

    // ✏️ 3. Actualizar el miembro (Petición 2)
    console.log('📡 [Petición 2] Actualizando miembro...');
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
    
    console.log('✅ PUT exitoso');

    // ⏳ ESPERA 3: Antes de verificar (después del PUT)
    console.log('⏳ [Espera 3/3] Esperando 20s antes de verificar...');
    await WaitForApi.seconds(20).performAs(actor);

    // 📋 4. Verificar cambios con GET (Petición 3)
    console.log('📡 [Petición 3] Verificando cambios con GET...');
    const getResponse = await actor.attemptsTo(
      GetMemberById.withId(memberId)
    );
    
    console.log(`📊 GET Status: ${getResponse.status()}`);
    
    // Si aún así da 429, esperar más
    if (getResponse.status() === 429) {
      console.log('⏳ Aún rate limit, esperando 20s más...');
      await WaitForApi.seconds(20).performAs(actor);
      
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

  // ============================================================
  // TC-API-006: PUT /api/members/:id - Intentar actualizar con datos inválidos
  // ============================================================
  test('TC-API-006: Update with invalid data - @negative @BVA', async () => {
    // ⏳ ESPERA 1: Antes de obtener miembro aleatorio
    console.log('⏳ [Espera 1/3] Esperando 20s para rate limit...');
    await WaitForApi.seconds(20).performAs(actor);

    // 🔍 1. Obtener un miembro aleatorio existente (Petición 1)
    console.log('📡 [Petición 1] Obteniendo miembro aleatorio...');
    const randomMember = await RandomMember.fromAPI(actor);
    const memberId = randomMember.id;
    
    console.log(`🔄 Miembro ID ${memberId}: "${randomMember.name}" (${randomMember.gender})`);

    // 💾 2. Guardar datos originales
    const originalName = randomMember.name;
    const originalGender = randomMember.gender;
    console.log(`💾 Datos originales: "${originalName}" (${originalGender})`);

    // ⏳ ESPERA 2: Antes de actualizar (después del GET)
    console.log('⏳ [Espera 2/3] Esperando 20s antes de actualizar...');
    await WaitForApi.seconds(20).performAs(actor);

    // 📝 3. Datos inválidos
    const invalidData = {
      name: '',
      gender: ''
    };

    console.log(`📝 [Petición 2] Enviando datos inválidos: ${JSON.stringify(invalidData)}`);

    // ✏️ 4. Intentar actualizar con datos inválidos (Petición 2)
    const response = await actor.attemptsTo(
      UpdateMember.withId(memberId, invalidData)
    );

    // ✅ 5. Validar status 400
    const statusCode = response.status();
    console.log(`📊 Status PUT: ${statusCode}`);
    
    // Si es 429, esperar y reintentar
    if (statusCode === 429) {
      console.log('⏳ Rate limit, esperando 20s más...');
      await WaitForApi.seconds(20).performAs(actor);
      
      const retryResponse = await actor.attemptsTo(
        UpdateMember.withId(memberId, invalidData)
      );
      
      const retryStatus = retryResponse.status();
      if (retryStatus === 429) {
        throw new Error('❌ Rate limit persistente');
      }
      
      await ValidateResponse.of(retryResponse)
        .withStatusCode(400)
        .performAs(actor);
      
      const errorBody = await ResponseBody.of(retryResponse).answeredBy(actor);
      console.log(`📋 Error: ${JSON.stringify(errorBody)}`);
      expect(errorBody.msg).toBeDefined();
      
      // ⏳ ESPERA 3: Antes de verificar
      console.log('⏳ [Espera 3/3] Esperando 20s antes de verificar...');
      await WaitForApi.seconds(20).performAs(actor);
      
      const getResponse = await actor.attemptsTo(
        GetMemberById.withId(memberId)
      );
      const getBody = await ResponseBody.of(getResponse).answeredBy(actor);
      expect(getBody.name).toBe(originalName);
      expect(getBody.gender).toBe(originalGender);
      
      console.log(`✅ Datos intactos: "${getBody.name}" (${getBody.gender})`);
      return;
    }

    await ValidateResponse.of(response)
      .withStatusCode(400)
      .performAs(actor);

    // ✅ 6. Validar mensaje de error
    const errorBody = await ResponseBody.of(response).answeredBy(actor);
    console.log(`📋 Error: ${JSON.stringify(errorBody)}`);
    
    const validErrorMessages = [
      'Name should be 4 to 25 characters long',
      'Please provide only name and gender',
      'Name should only contain Alphabets'
    ];
    
    const isValidError = validErrorMessages.some(msg => errorBody.msg?.includes(msg));
    expect(isValidError).toBe(true);
    console.log(`✅ Mensaje de error válido: "${errorBody.msg}"`);

    // ⏳ ESPERA 3: Antes de verificar integridad (después del PUT)
    console.log('⏳ [Espera 3/3] Esperando 20s antes de verificar integridad...');
    await WaitForApi.seconds(20).performAs(actor);

    // 📋 7. Verificar que los datos NO se corrompieron (Petición 3)
    console.log('📡 [Petición 3] Verificando integridad de los datos...');
    const getResponse = await actor.attemptsTo(
      GetMemberById.withId(memberId)
    );
    
    const getBody = await ResponseBody.of(getResponse).answeredBy(actor);
    console.log(`📋 Datos actuales: "${getBody.name}" (${getBody.gender})`);
    
    // ✅ 8. Validar que los datos originales se mantienen
    expect(getBody.name).toBe(originalName);
    expect(getBody.gender).toBe(originalGender);
    
    console.log(`✅ Datos intactos: "${getBody.name}" (${getBody.gender})`);
    console.log('✅ TC-API-006 completado');
  });

  // ============================================================
  // TC-API-007: DELETE /api/members/:id - Eliminar miembro y verificar
  // ============================================================
  test('TC-API-007: Delete member and verify - @smoke @positive @StateTransition', {  },
    async () => {
      // ⏳ ESPERA 1: Antes de obtener lista de miembros
      console.log('⏳ [Espera 1/4] Esperando 20s para rate limit...');
      await WaitForApi.seconds(20).performAs(actor);

      // 🔍 1. Obtener todos los miembros (Petición 1)
      console.log('📡 [Petición 1] Obteniendo lista de miembros...');
      const allMembersResponse = await actor.attemptsTo(
        GetAllMembers.fromAPI()
      );
      const allMembers = await ResponseBody.of(allMembersResponse).answeredBy(actor);
      
      console.log(`📋 ${allMembers.length} miembros encontrados`);
      
      // Filtrar miembros con ID > 4 para no eliminar los datos iniciales
      const deletableMembers = allMembers.filter((m: any) => m.id > 4);
      
      if (deletableMembers.length === 0) {
        // Si no hay miembros para eliminar, crear uno primero
        console.log('📝 No hay miembros para eliminar, creando uno...');
        
        const memberData = {
          name: TestDataGenerator.getValidName(),
          gender: TestDataGenerator.getValidGender()
        };
        
        const createResponse = await actor.attemptsTo(
          CreateMember.withData(memberData)
        );
        const createBody = await ResponseBody.of(createResponse).answeredBy(actor);
        const newMemberId = createBody.id;
        
        console.log(`✅ Miembro creado con ID ${newMemberId}`);
        
        // ⏳ ESPERA 2: Antes de eliminar
        console.log('⏳ [Espera 2/4] Esperando 20s antes de eliminar...');
        await WaitForApi.seconds(20).performAs(actor);
        
        // Eliminar el miembro creado
        console.log(`📡 [Petición 2] Eliminando miembro ID ${newMemberId}...`);
        const deleteResponse = await actor.attemptsTo(
          DeleteMember.byId(newMemberId)
        );
        
        await ValidateResponse.of(deleteResponse)
          .withStatusCode(200)
          .performAs(actor);
        
        console.log('✅ DELETE exitoso');
        
        // ⏳ ESPERA 3: Antes de verificar
        console.log('⏳ [Espera 3/4] Esperando 20s antes de verificar...');
        await WaitForApi.seconds(20).performAs(actor);
        
        // Verificar que ya no existe
        console.log(`📡 [Petición 3] Verificando que ID ${newMemberId} ya no existe...`);
        const getResponse = await actor.attemptsTo(
          GetMemberById.withId(newMemberId)
        );
        
        const statusCode = await ResponseCode.of(getResponse).answeredBy(actor);
        expect(statusCode).toBe(404);
        
        const getBody = await ResponseBody.of(getResponse).answeredBy(actor);
        expect(getBody.msg).toContain(`Member with id ${newMemberId} doesn't exist`);
        
        console.log(`✅ Miembro ID ${newMemberId} eliminado correctamente`);
        return;
      }
      
      // Seleccionar un miembro aleatorio para eliminar
      const randomIndex = Math.floor(Math.random() * deletableMembers.length);
      const memberToDelete = deletableMembers[randomIndex];
      const memberId = memberToDelete.id;
      
      console.log(`🗑️ Eliminando miembro ID ${memberId}: "${memberToDelete.name}" (${memberToDelete.gender})`);

      // ⏳ ESPERA 2: Antes de eliminar (después del GET)
      console.log('⏳ [Espera 2/4] Esperando 20s antes de eliminar...');
      await WaitForApi.seconds(20).performAs(actor);

      // 🗑️ 2. Eliminar el miembro (Petición 2)
      console.log(`📡 [Petición 2] Eliminando miembro ID ${memberId}...`);
      const deleteResponse = await actor.attemptsTo(
        DeleteMember.byId(memberId)
      );

      // ✅ 3. Validar status 200
      await ValidateResponse.of(deleteResponse)
        .withStatusCode(200)
        .performAs(actor);
      
      // Validar mensaje de éxito
      const deleteBody = await ResponseBody.of(deleteResponse).answeredBy(actor);
      console.log(`📋 Respuesta DELETE: ${JSON.stringify(deleteBody)}`);
      expect(deleteBody.msg).toContain(`Member with id ${memberId} is deleted successfully`);
      
      console.log('✅ DELETE exitoso');

      // ⏳ ESPERA 3: Antes de verificar (después del DELETE)
      console.log('⏳ [Espera 3/4] Esperando 20s antes de verificar...');
      await WaitForApi.seconds(20).performAs(actor);

      // 📋 4. Verificar que ya no existe con GET (Petición 3)
      console.log(`📡 [Petición 3] Verificando que ID ${memberId} ya no existe...`);
      const getResponse = await actor.attemptsTo(
        GetMemberById.withId(memberId)
      );

      // ✅ 5. Validar que devuelve 404
      const statusCode = await ResponseCode.of(getResponse).answeredBy(actor);
      expect(statusCode).toBe(404);

      const getBody = await ResponseBody.of(getResponse).answeredBy(actor);
      expect(getBody.msg).toContain(`Member with id ${memberId} doesn't exist`);
      
      console.log(`✅ Miembro ID ${memberId} eliminado correctamente`);

      // ⏳ ESPERA 4: Antes de verificar lista completa (opcional)
      console.log('⏳ [Espera 4/4] Esperando 20s antes de verificar lista...');
      await WaitForApi.seconds(20).performAs(actor);

      // 📋 6. Verificar que ya no aparece en la lista completa (Petición 4)
      console.log('📡 [Petición 4] Verificando que no aparece en la lista...');
      const updatedListResponse = await actor.attemptsTo(
        GetAllMembers.fromAPI()
      );
      const updatedList = await ResponseBody.of(updatedListResponse).answeredBy(actor);
      
      // Buscar el miembro en la lista actualizada
      const memberExists = updatedList.some((m: any) => m.id === memberId);
      expect(memberExists).toBe(false);
      
      console.log(`✅ Miembro ID ${memberId} no aparece en la lista`);
      console.log('✅ TC-API-007 completado: Ciclo de vida DELETE verificado');
    }
  );
});