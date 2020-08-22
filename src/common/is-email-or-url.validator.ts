import { isEmail, isURL, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator'

@ValidatorConstraint({ async: true })
export class EachIsEmailOrHttpOrSmtp implements ValidatorConstraintInterface {
  public async validate(input: string[]): Promise<boolean> {
    for (const item of input) {
      if (
        !(
          isEmail(item) ||
          isURL(item, {
            protocols: ['http', 'https', 'smtp', 'smtps'],
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
