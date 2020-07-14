import {AbstractControl, FormControl, NG_VALIDATORS, ValidationErrors, Validator} from '@angular/forms';
import {Directive, Input, NgZone} from '@angular/core';

/**
 * Directive used to validate passwords in the sign up process.
 */
@Directive({
    selector: '[appPasswordValidator]',
    providers: [
        {provide: NG_VALIDATORS, useExisting: PasswordValidatorDirective, multi: true}
    ]
})
export class PasswordValidatorDirective implements Validator {

    /**
     * Input string to validate against.
     */
    @Input('appPasswordValidator')
    public control: AbstractControl;

    constructor(
        private readonly _zone: NgZone
    ) {
    }

    /**
     * Validate the passed control.
     * @param control to validate
     */
    public validate(control: AbstractControl): ValidationErrors | null {
        const value = control.value;

        if (!!value && !!this.control) {
            const otherValue = this.control.value;

            if (!value || value.localeCompare(otherValue) !== 0) {
                return {
                    passwordValidation: {
                        anticipated: otherValue,
                        actual: value
                    }
                };
            }
        }

        if (!!this.control) {
            (this.control as any).status = 'VALID';
        }

        return null;
    }

}
