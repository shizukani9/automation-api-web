// src/tasks/api/GetAllMembers.ts
import { Actor } from '../../actors/Actor';
import { CallAnApi } from '../../actors/abilities/CallAnApi';
import { SendRequest } from '../../interactions/api/SendRequest';

export class GetAllMembers {
  static fromAPI(): GetAllMembers {
    return new GetAllMembers();
  }

  async performAs(actor: Actor): Promise<any> {
    const ability = actor.abilityTo(CallAnApi);
    const url = ability.getUrl('/api/members');

    return actor.attemptsTo(
      SendRequest.to(url, {
        method: 'GET',
      })
    );
  }
}