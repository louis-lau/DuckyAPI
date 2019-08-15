import { ValidationArguments, Validator, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator"

@ValidatorConstraint({ async: true })
export class EachIsEmailOrHttpOrSmtp implements ValidatorConstraintInterface {
  private validator = new Validator()

  public async validate(input: string[]): Promise<boolean> {
    for (const item of input) {
      if (
        !(
          this.validator.isEmail(item) ||
          this.validator.isURL(item, {
            protocols: ["http", "https", "smtp", "smtps"],
            // eslint-disable-next-line @typescript-eslint/camelcase
            require_protocol: true
          })
        )
      ) {
        return false
      }
    }
    return true
  }

  public defaultMessage(args: ValidationArguments): string {
    // here you can provide default error message if validation failed
    return `Each item in ${args.property} must be either an email, http(s) url, smtp(s) url`
  }
}
