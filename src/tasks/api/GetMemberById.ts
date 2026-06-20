// src/tasks/api/GetMemberById.ts
import { Actor } from '../../actors/Actor';
import { CallAnApi } from '../../actors/abilities/CallAnApi';
import { SendRequest } from '../../interactions/api/SendRequest';

export class GetMemberById {
  private memberId: number;

  constructor(memberId: number) {
    this.memberId = memberId;
  }

  static withId(id: number): GetMemberById {
    return new GetMemberById(id);
  }

  async performAs(actor: Actor): Promise<any> {
    const ability = actor.abilityTo(CallAnApi);
    const url = ability.getUrl(`/api/members/${this.memberId}`);

    return actor.attemptsTo(
      SendRequest.to(url, {
        method: 'GET',
      })
    );
  }
}