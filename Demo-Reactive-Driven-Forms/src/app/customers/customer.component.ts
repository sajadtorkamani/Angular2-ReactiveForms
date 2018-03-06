import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import 'rxjs/add/operator/debounceTime';

import { Customer } from './customer';

const ratingRangeValidator = (control: AbstractControl): { [key: string]: boolean } | null => {
  const value = control.value;

  if (typeof value !== 'undefined' && isNaN(value) || value < 1 || value > 5) {
    return { 'range': true };
  }

  return null;
};

@Component({
  selector: 'my-signup',
  templateUrl: './app/customers/customer.component.html'
})
export class CustomerComponent implements OnInit {
  customerForm: FormGroup;
  customer: Customer = new Customer();
  emailErrors: string = '';

  get addresses(): FormArray {
    return <FormArray>this.customerForm.get('addresses');
  }

  private _validationMessages = {
    required: 'Please enter your email address.',
    pattern: 'Please enter a valid email address.'
  };

  constructor(private _fb: FormBuilder) {

  }

  /**
   * Lifecycle hook
   */
  ngOnInit(): void {
    this.customerForm = this._fb.group({
      firstName: ['', [Validators.required, Validators.minLength(3)]],
      lastName: ['', [Validators.required, Validators.maxLength(50)]],
      emailGroup: this._fb.group({
        email: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+')]],
        confirmEmail: ['', [Validators.required]]
      }),
      phone: '',
      notification: 'email',
      rating: ['', ratingRangeValidator],
      sendCatalog: true,
      addresses: this._fb.array([this.buildAddressGroup()])
    });

    this.customerForm.get('notification').valueChanges.subscribe(value => {
      this.updatePhoneValidation(value);
    });

    const emailControl = this.customerForm.get('emailGroup.email');
    emailControl.valueChanges
      .debounceTime(1000)
      .subscribe(value => {
        this._setEmailErrors(emailControl);
      });
  };

  /**
   * Save the form.
   */
  save() {
    console.log(this.customerForm);
    console.log('Saved: ' + JSON.stringify(this.customerForm.value));
  }

  /**
   * Populate form with some test data.
   */
  populateTestData(): void {
    this.customerForm.patchValue({
      firstName: 'Sajad'
    })
  }

  /**
   * Update the phone control validation.
   *
   * @param {string} notificationMethod
   */
  updatePhoneValidation(notificationMethod: string): void {
    const phoneControl = this.customerForm.get('phone');

    if (notificationMethod === 'text') {
      phoneControl.setValidators(Validators.required);
    }
    else {
      phoneControl.clearValidators();
    }

    phoneControl.updateValueAndValidity();
  }

  /**
   * Set email control errors.
   *
   * @param {AbstractControl} control
   * @private
   */
  private _setEmailErrors(control: AbstractControl): void {
    console.log(control);
    if (!control.errors) {
      this.emailErrors = '';
      return;
    }

    this.emailErrors = Object
      .keys(control.errors)
      .map(key => this._validationMessages[key])
      .join(' ');
  }

  /**
   * Build the address form group.
   *
   * @returns {FormGroup}
   */
  buildAddressGroup(): FormGroup {
    return this._fb.group({
      addressType: 'home',
      street1: '',
      street2: '',
      city: '',
      state: '',
      zip: ''
    })
  }

  /**
   * Add another address group.
   */
  addAddress(): void {
    this.addresses.push(this.buildAddressGroup());
  }

  /**
   * Remove an address group.
   *
   * @param {number} index
   */
  removeAddress(index: number): void {
    this.addresses.removeAt(index);
  }
}
