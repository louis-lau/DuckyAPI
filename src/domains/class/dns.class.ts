import { ApiModelProperty } from '@nestjs/swagger'
import { DnsConfig } from 'src/constants'

class DnsCheckMxRecord {
  @ApiModelProperty({ example: DnsConfig.mx.records[0].exchange, description: 'MX record server' })
  public exchange: string

  @ApiModelProperty({ example: DnsConfig.mx.records[0].priority, description: 'MX record priority' })
  public priority: number
}

class DnsCheckDkimRecord {
  @ApiModelProperty({ example: 'default', description: 'DKIM record selector' })
  public selector: string

  @ApiModelProperty({
    example:
      'v=DKIM1;t=s;p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAseRvI//jDgRsZ1BtGixcLO16/B8yEzsgVSBvCWgwf39LRAey14eZLoyyolX7wVUe71VN67cEuey7XlYGHzGntDtLh/CmI8vvDaiym0VNv8zrZok2TbYW0I4Ts9YkNtCUC5EKjyrwX7AT97ZjiXVX6JK+oEmdtgwxtrQc9+trYj3udlStEmpH0yluY3kSmUYDe3e4TEdLUX7+x/i4D8+65dIXdw52cRNka9aMpH7ZdsfPvrFd6y+ItOuX1Zsb8uFdQz21/Tf1aVczwbZgpUFfpyt55erLwfFLdlH7aRwBIJGQDMzl4SFkGgxDuSPjUePHO266PiHm2/r8A0515n3ZCwIDAQAB',
    description: 'DKIM record value',
  })
  public value: string
}

class DnsCheckCurrentValues {
  @ApiModelProperty({ description: 'List of DNS records', type: DnsCheckMxRecord, isArray: true })
  public mx: DnsCheckMxRecord[]

  @ApiModelProperty({ example: DnsConfig.spf.correctValue, description: 'Value of the SPF record' })
  public spf: string

  @ApiModelProperty({ description: 'DKIM record selector and value', required: false })
  public dkim?: DnsCheckDkimRecord
}

class DnsCheckError {
  @ApiModelProperty({ example: 'dkim', description: 'Type of error/warning. Can be ns, mx, spf, dkim' })
  public type: 'ns' | 'mx' | 'spf' | 'dkim'

  @ApiModelProperty({ example: 'DkimNotFound', description: 'Machine readable error/warning string' })
  public error: string

  @ApiModelProperty({
    example: 'DKIM is enabled, but no record was found',
    description: 'Human readable error/warning message',
  })
  public message: string
}

class DnsCheckWarning extends DnsCheckError {}
class DnsCheckCorrectValues extends DnsCheckCurrentValues {}

export class DnsCheck {
  @ApiModelProperty({ description: 'Current values of the DNS records' })
  public currentValues: DnsCheckCurrentValues

  @ApiModelProperty({ description: 'Correct values of the DNS records' })
  public correctValues: DnsCheckCorrectValues

  @ApiModelProperty({ description: 'List of errors with the DNS records', type: DnsCheckError, isArray: true })
  public errors: DnsCheckError[]

  @ApiModelProperty({ description: 'List of warnings with the DNS records', type: DnsCheckError, isArray: true })
  public warnings: DnsCheckWarning[]
}
