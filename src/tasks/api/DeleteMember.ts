// src/tasks/api/DeleteMember.ts
import { Actor } from '../../actors/Actor';
import { CallAnApi } from '../../actors/abilities/CallAnApi';
import { SendRequest } from '../../interactions/api/SendRequest';

export class DeleteMember {
  private memberId: number;

  constructor(memberId: number) {
    this.memberId = memberId;
  }

  static byId(id: number): DeleteMember {
    return new DeleteMember(id);
  }

  async performAs(actor: Actor): Promise<any> {
    const ability = actor.abilityTo(CallAnApi);
    const url = ability.getUrl(`/api/members/${this.memberId}`);

    return actor.attemptsTo(
      SendRequest.to(url, {
        method: 'DELETE',
      })
    );
  }
}