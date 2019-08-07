import { Controller } from "@nestjs/common"

import { DomainsService } from "./domains.service"

@Controller("domains")
export class DomainsController {
  public constructor(private readonly domainsService: DomainsService) {}
}
