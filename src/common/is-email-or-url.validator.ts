import { ValidationArguments, Validator, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator'

@ValidatorConstraint({ async: true })
export class EachIsEmailOrHttpOrSmtp implements ValidatorConstraintInterface {
  private validator = new Validator()

  public async validate(input: string[]): Promise<boolean> {
    for (const item of input) {
      if (
        !(
          this.validator.isEmail(item) ||
          this.validator.isURL(item, {
            protocols: ['http', 'https', 'smtp', 'smtps'],
            // eslint-disable-next-line @typescript-eslint/camelcase
            require_protocol: true,
          })
        )
      ) {
        // Item is not an email or an url with a valid protocol
        return false
      }
    }
    // None of the items returned false, all items are valid
    return true
  }

  public defaultMessage(args: ValidationArguments): string {
    return `Each item in ${args.property} must be either an email, http(s) url, smtp(s) url`
  }
}
