import { Component, OnInit } from '@angular/core';
import { Tier_States } from '../enum/tier_states';
import { FormGroup, FormArray } from '@angular/forms';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { Animations } from '../animations/animations';
import { FormlyGroup } from '@ngx-formly/core/lib/templates/formly.group';
import { SharingService } from '../services/shared.service';
import { Router } from '@angular/router';

// import { runInThisContext } from 'vm';
import { APIService } from '../services/api.service';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { map } from 'rxjs/operators';

export interface TierFields {
  id: string;
  tier: string;
  fields: FormlyFieldConfig[];
}

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.sass'],
  //providers: [SharingService],
})
export class FormComponent implements OnInit {
  public t1_collapse: boolean = false;
  public t2_collapse: boolean = true;
  public t3_collapse: boolean = true;

  public t1_state: string;
  public t2_state: string;
  public t3_state: string;

  public issue: boolean;
  public update: boolean;

  private new_model: any;
  public model: any;

  public proofObject: any;

  public application_number: any;
  public tier: any;

  private applicationNumber: any;
  private connectionId: any;

  public alert: boolean = false;
  public alertType: string;
  public alertMsg: string;
  public alertTitle: string;
  public alertDisabled: boolean = false;
  public alertConfirmation: boolean = false;
  private data;

  constructor(
    private sharingService: SharingService,
    private _router: Router
  ) {}

  getData(): void {
    this.data = this.sharingService.getData();
  }

  setData(data): void {
    this.sharingService.setData(data);
  }
  ngOnInit(): void {
    //Retrieve the data from the previous component
    this.getData();
    // console.log(`data:` + JSON.stringify(data));

    //Retrieve the data from sessionStorage.
    let saved_model = sessionStorage.getItem('model');

    //Validate if the data is null or undefined. If it is, the model is empty.
    // console.log(JSON.stringify(saved_model));

    console.log(this.data);

    if (
      this.data === null ||
      this.data === undefined ||
      this.data.presentation === undefined
    ) {
      if (saved_model != null || saved_model != undefined) {
        console.log('SESSION');

        this.issue = false;
        this.update = true;
        this.model = JSON.parse(saved_model);
      } else {
        console.log('MODEL');
        this.issue = true;
        this.update = false;
        this.model = {
          //TIER 1
          first_name: '',
          middle_name: '',
          last_name: '',
          other_name: '',
          phone_number: '',
          home_address: '',
          email: '',
          unit: '',
          postal_code: '',
          city: '',
          province: '',

          //TIER 2
          date_of_birth: '',
          birth_city: '',
          birth_country: '',
          sex: '',
          license_number: '',
          dd: '',
          class: '',
          expiration_date: '',
          eye_color: '',
          height: '',

          //TIER 3
          sin: '',
          health_principal_name: '',
          health_card_number: '',
          health_coverage_start_date: '',
          bank_institution_number: '',
          bank_transit_code: '',
          bank_account_number: '',

          //CONTROL
          application_number: '',
          tier: 0,
        };
      }
    } else {
      this.issue = false;
      this.update = true;

      //WIP:
      console.log(this.data.presentation);

      let test = this.data.presentation.requested_proof.revealed_attrs;
      // console.log(`proof in sharing data: ${JSON.stringify(test)}`);
      this.applicationNumber = test['application_number'].raw;
      this.tier = test['tier'].raw;
      let proofData = {};
      Object.keys(test).forEach((data) => {
        proofData[data] = test[data].raw;
      });
      this.new_model = proofData;
      // console.log(`proof in model: ${JSON.stringify(proofData)}`);
      this.connectionId = this.data.connection_id;

      if (this.new_model !== null && this.new_model !== undefined) {
        this.model = this.new_model;
      }
    }

    //Update the tabs status, depending on the model.
    this.updateTabTier(this.model.tier.toString());
  }

  //Form fields.
  all_tiers: TierFields[] = [
    {
      id: 'tierOne',
      tier: 'Tier 1',
      fields: [
        {
          fieldGroupClassName: 'row mb-4',
          fieldGroup: [
            {
              className: 'col-12',
              template:
                '<div class="mb-tier-group-headers"><strong>NAME</strong><hr /></div>',
            },
            {
              className: 'col-12 col-md-6',
              type: 'input',
              key: 'first_name',
              // modelOptions: {
              //   updateOn: 'blur',
              // },
              templateOptions: {
                label: 'First Name',
                required: true,
              },
            },
            {
              className: 'col-12 col-md-6',
              type: 'input',
              key: 'middle_name',
              // modelOptions: {
              //   updateOn: 'blur',
              // },
              templateOptions: {
                label: 'Middle Name',
              },
            },
            {
              className: 'col-12 col-md-6',
              type: 'input',
              key: 'last_name',
              // modelOptions: {
              //   updateOn: 'blur',
              // },
              templateOptions: {
                label: 'Family Name',
                required: true,
              },
            },
            {
              className: 'col-12 col-md-6',
              type: 'input',
              key: 'other_name',
              // modelOptions: {
              //   updateOn: 'blur',
              // },
              templateOptions: {
                label: 'Other Names',
              },
            },
          ],
        },
        {
          fieldGroupClassName: 'row mb-4',
          fieldGroup: [
            {
              className: 'col-12',
              template:
                '<div class="mb-tier-group-headers"><strong>CONTACT</strong><hr /></div>',
            },
            {
              className: 'col-12 col-md-6',
              type: 'mobile',
              key: 'phone_number',
              modelOptions: {
                updateOn: 'blur',
              },
              templateOptions: {
                type: 'number',
                label: 'Mobile Number',
                required: true,
                pattern: /^[1-9]\d{2}\d{3}\d{4}$/,
              },
              validation: {
                messages: {
                  pattern: (error, field: FormlyFieldConfig) =>
                    `"${field.formControl.value}" is not a valid mobile number.`,
                },
              },
            },
            {
              className: 'col-12 col-md-6',
              type: 'input',
              key: 'email',
              modelOptions: {
                updateOn: 'blur',
              },
              templateOptions: {
                type: 'email',
                label: 'Email',
                required: true,
                pattern: /^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/,
              },
              validation: {
                messages: {
                  pattern: (error, field: FormlyFieldConfig) =>
                    `"${field.formControl.value}" is not a valid email address.`,
                },
              },
            },
          ],
        },
        {
          fieldGroupClassName: 'row mb-4',
          fieldGroup: [
            {
              className: 'col-12',
              template:
                '<div class="mb-tier-group-headers"><strong>ADDRESS</strong><hr /></div>',
            },
            {
              className: 'col-12 col-md-6',
              type: 'input',
              key: 'home_address',
              // modelOptions: {
              //   updateOn: 'blur',
              // },
              templateOptions: {
                label: 'Street Number',
                required: true,
              },
            },
            {
              className: 'col-12 col-md-6',
              type: 'input',
              key: 'unit',
              // modelOptions: {
              //   updateOn: 'blur',
              // },
              templateOptions: {
                label: 'Suite/Apartment/Unit Number',
                required: true,
              },
            },
            {
              className: 'col-12 col-md-4',
              key: 'city',
              type: 'input',
              // modelOptions: {
              //   updateOn: 'blur',
              // },
              templateOptions: {
                label: 'City',
                required: true,
              },
            },
            {
              className: 'col-12 col-md-4',
              key: 'province',
              type: 'select',
              // modelOptions: {
              //   updateOn: 'blur',
              // },
              templateOptions: {
                required: true,
                label: 'Province',
                valueProp: 'abbreviation',
                labelProp: 'name',
                options: [
                  {
                    name: 'Alberta',
                    abbreviation: 'AB',
                  },
                  {
                    name: 'British Columbia',
                    abbreviation: 'BC',
                  },
                  {
                    name: 'Manitoba',
                    abbreviation: 'MB',
                  },
                  {
                    name: 'New Brunswick',
                    abbreviation: 'NB',
                  },
                  {
                    name: 'Newfoundland and Labrador',
                    abbreviation: 'NL',
                  },
                  {
                    name: 'Northwest Territories',
                    abbreviation: 'NT',
                  },
                  {
                    name: 'Nova Scotia',
                    abbreviation: 'NS',
                  },
                  {
                    name: 'Nunavut',
                    abbreviation: 'NU',
                  },
                  {
                    name: 'Ontario',
                    abbreviation: 'ON',
                  },
                  {
                    name: 'Prince Edward Island',
                    abbreviation: 'PE',
                  },
                  {
                    name: 'Quebec',
                    abbreviation: 'QC',
                  },
                  {
                    name: 'Saskatchewan',
                    abbreviation: 'SK',
                  },
                  {
                    name: 'Yukon Territory',
                    abbreviation: 'YT',
                  },
                ],
              },
            },
            {
              className: 'col-12 col-md-4',
              type: 'postal',
              key: 'postal_code',
              // modelOptions: {
              //   updateOn: 'blur',
              // },
              templateOptions: {
                required: true,
                label: 'Postal Code',
                // placeholder: 'R2C 3C6'
              },
            },
          ],
        },
      ],
    },
    {
      id: 'tierTwo',
      tier: 'Tier 2',
      fields: [
        {
          fieldGroupClassName: 'row mb-4',
          fieldGroup: [
            {
              className: 'col-12',
              template:
                '<div class="mb-tier-group-headers"><strong>GENERAL INFORMATION</strong><hr /></div>',
            },
            {
              className: 'col-12 col-md-6 col-lg-3',
              type: 'date',
              key: 'date_of_birth',
              // modelOptions: {
              //   updateOn: 'blur',
              // },
              templateOptions: {
                placeholder: 'dd/mm/yyyy',
                label: 'Birthday date',
                // required: true,
              },
              expressionProperties: {
                // 'templateOptions.required': 'formState.tierOne',
                // 'templateOptions.disabled': '!formState.tierOne',
              },
            },
            {
              className: 'col-12 col-md-6 col-lg-3',
              type: 'input',
              key: 'birth_country',
              // modelOptions: {
              //   updateOn: 'blur',
              // },
              templateOptions: {
                label: 'Birth Country',
                // required: true,
              },
              expressionProperties: {
                // 'templateOptions.required': 'formState.tierOne',
                // 'templateOptions.disabled': '!formState.tierOne',
              },
            },
            {
              className: 'col-12 col-md-6 col-lg-3',
              type: 'input',
              key: 'birth_city',
              // modelOptions: {
              //   updateOn: 'blur',
              // },
              templateOptions: {
                label: 'Birth City',
                // required: true,
              },
              expressionProperties: {
                // 'templateOptions.required': 'formState.tierOne',
                // 'templateOptions.disabled': '!formState.tierOne',
              },
            },
            {
              className: 'col-12 col-md-6 col-lg-3',
              type: 'select',
              key: 'sex',
              // modelOptions: {
              //   updateOn: 'blur',
              // },
              templateOptions: {
                // required: true,
                label: 'Sex',
                valueProp: 'name',
                labelProp: 'name',
                options: [
                  {
                    name: 'Female',
                    abbreviation: 'F',
                  },
                  {
                    name: 'Male',
                    abbreviation: 'M',
                  },
                  {
                    name: 'Other',
                    abbreviation: 'O',
                  },
                ],
              },
              expressionProperties: {
                // 'templateOptions.required': 'formState.tierOne',
                // 'templateOptions.disabled': '!formState.tierOne',
              },
            },
          ],
        },
        {
          fieldGroupClassName: 'row mb-4',
          fieldGroup: [
            {
              className: 'col-12',
              template:
                '<div class="mb-tier-group-headers"><strong>DRIVER LICENSE</strong><hr /></div>',
            },
            {
              className: 'col-12 col-md-6',
              type: 'input',
              key: 'license_number',
              // modelOptions: {
              //   updateOn: 'blur',
              // },
              templateOptions: {
                label: 'Driver License',
                // required: true,
              },
              expressionProperties: {
                // 'templateOptions.required': 'formState.tierOne',
                // 'templateOptions.disabled': '!formState.tierOne',
              },
            },
            {
              className: 'col-12 col-md-6',
              type: 'input',
              key: 'dd',
              // modelOptions: {
              //   updateOn: 'blur',
              // },
              templateOptions: {
                label: 'DD',
                // required: true,
              },
              expressionProperties: {
                // 'templateOptions.required': 'formState.tierOne',
                // 'templateOptions.disabled': '!formState.tierOne',
              },
            },
            {
              className: 'col-6 col-md-3 col-lg-3',
              type: 'select',
              key: 'class',
              // modelOptions: {
              //   updateOn: 'blur',
              // },
              templateOptions: {
                label: 'Class',
                valueProp: 'name',
                labelProp: 'name',
                options: [
                  {
                    name: 'Class 1',
                  },
                  {
                    name: 'Class 2',
                  },
                  {
                    name: 'Class 3',
                  },
                  {
                    name: 'Class 4',
                  },
                  {
                    name: 'Class 5',
                  },
                  {
                    name: 'Class 6',
                  },
                  {
                    name: 'Class 7',
                  },
                  {
                    name: 'Class 8',
                  },
                ],
                // required: true,
              },
              expressionProperties: {
                // 'templateOptions.required': 'formState.tierOne',
                // 'templateOptions.disabled': '!formState.tierOne',
              },
            },
            {
              className: 'col-6 col-md-3 col-lg-3',
              type: 'date',
              key: 'expiration_date',
              // modelOptions: {
              //   updateOn: 'blur',
              // },
              templateOptions: {
                label: 'Expiration date',
                placeholder: 'dd/mm/yyyy',
                // required: true,
              },
              expressionProperties: {
                // 'templateOptions.required': 'formState.tierOne',
                // 'templateOptions.disabled': '!formState.tierOne',
              },
            },
            {
              className: 'col-6 col-md-3 col-lg-3',
              type: 'select',
              key: 'eye_color',
              // modelOptions: {
              //   updateOn: 'blur',
              // },
              templateOptions: {
                label: 'Eye color',
                valueProp: 'name',
                labelProp: 'name',
                options: [
                  { name: 'Blue' },
                  { name: 'Green' },
                  { name: 'Brown' },
                  { name: 'Hazel' },
                  { name: 'Amber' },
                ],
              },
              expressionProperties: {
                // 'templateOptions.required': 'formState.tierOne',
                // 'templateOptions.disabled': '!formState.tierOne',
              },
            },
            {
              className: 'col-6 col-md-3 col-lg-3',
              type: 'input',
              key: 'height',
              // modelOptions: {
              //   updateOn: 'blur',
              // },
              templateOptions: {
                label: 'Heigth',
              },
              expressionProperties: {
                // 'templateOptions.required': 'formState.tierOne',
                // 'templateOptions.disabled': '!formState.tierOne',
              },
            },
          ],
        },
      ],
    },
    {
      id: 'tierThree',
      tier: 'Tier 3',
      fields: [
        {
          fieldGroupClassName: 'row mb-4',
          fieldGroup: [
            {
              className: 'col-12',
              template:
                '<div class="mb-tier-group-headers"><strong>SOCIAL SECURITY</strong><hr /></div>',
            },
            {
              className: 'col-12',
              key: 'sin',
              type: 'sin',
              // modelOptions: {
              //   updateOn: 'blur',
              // },
              templateOptions: {
                label: 'Social Insurance Number',
                // required: true,
                type: 'number',
              },
              expressionProperties: {
                // 'templateOptions.required': 'formState.tierTwo',
                // 'templateOptions.disabled': '!formState.tierTwo',
              },
            },
          ],
        },
        {
          fieldGroupClassName: 'row mb-4',
          fieldGroup: [
            {
              className: 'col-12',
              template:
                '<div class="mb-tier-group-headers"><strong>MANITOBA HEALTH</strong><hr /></div>',
            },
            {
              className: 'col-12 col-md-4',
              key: 'health_card_number',
              type: 'number',
              // modelOptions: {
              //   updateOn: 'blur',
              // },
              templateOptions: {
                label: 'Card number',
                maskString: '000000',
                // required: true,
              },
              expressionProperties: {
                // 'templateOptions.required': 'formState.tierTwo',
                // 'templateOptions.disabled': '!formState.tierTwo',
              },
            },
            {
              className: 'col-12 col-md-4',
              key: 'health_principal_name',
              type: 'input',
              // modelOptions: {
              //   updateOn: 'blur',
              // },
              templateOptions: {
                label: 'Principal name',
                // required: true,
              },
              expressionProperties: {
                // 'templateOptions.required': 'formState.tierTwo',
                // 'templateOptions.disabled': '!formState.tierTwo',
              },
            },
            {
              className: 'col-12 col-md-4',
              key: 'health_coverage_start_date',
              type: 'date',
              // modelOptions: {
              //   updateOn: 'blur',
              // },
              templateOptions: {
                label: 'Coverage start date',
                placeholder: 'dd/mm/yyyy',
                // required: true,
              },
              expressionProperties: {
                // 'templateOptions.required': 'formState.tierTwo',
                // 'templateOptions.disabled': '!formState.tierTwo',
              },
            },
          ],
        },
        {
          fieldGroupClassName: 'row mb-4',
          fieldGroup: [
            {
              className: 'col-12',
              template:
                '<div class="mb-tier-group-headers"><strong>BANK INFORMATION</strong><hr /></div>',
            },
            {
              className: 'col-12 col-md-4',
              key: 'bank_institution_number',
              type: 'select',
              // modelOptions: {
              //   updateOn: 'blur',
              // },
              templateOptions: {
                type: 'number',
                label: 'Institution number',
                valueProp: 'value',
                labelProp: 'name',
                options: [
                  {
                    name: 'Bank of Montreal',
                    value: '001',
                  },
                  {
                    name: 'Scotiabank',
                    value: '002',
                  },
                  {
                    name: 'Royal Bank of Canada',
                    value: '003',
                  },
                  {
                    name: 'National Bank of Canada',
                    value: '006',
                  },
                  {
                    name: 'HSBC Bank Canada	',
                    value: '016',
                  },
                ],
                // required: true,
              },
              expressionProperties: {
                // 'templateOptions.required': 'formState.tierTwo',
                // 'templateOptions.disabled': '!formState.tierTwo',
              },
            },
            {
              className: 'col-12 col-md-4',
              key: 'bank_transit_code',
              type: 'number',
              // modelOptions: {
              //   updateOn: 'blur',
              // },
              templateOptions: {
                label: 'Transfer number',
                maskString: '00000',
              },
              expressionProperties: {
                // 'templateOptions.required': 'formState.tierTwo',
                // 'templateOptions.disabled': '!formState.tierTwo',
              },
            },
            {
              className: 'col-12 col-md-4',
              key: 'bank_account_number',
              type: 'number',
              // modelOptions: {
              //   updateOn: 'blur',
              // },
              templateOptions: {
                label: 'Account number',
                maskString: '00000',
                // required: true,
              },
              expressionProperties: {
                // 'templateOptions.required': 'formState.tierTwo',
                // 'templateOptions.disabled': '!formState.tierTwo',
              },
            },
          ],
        },
      ],
    },
  ];

  //Build the form.
  form = new FormArray(this.all_tiers.map(() => new FormGroup({})));
  // options = this.all_tiers.map(() => <FormlyFormOptions>{});

  //Form options. Help to pass the status of each form to the fields.
  options: FormlyFormOptions = {
    formState: {
      tierOne: false,
      tierTwo: false,
      tierThree: false,
    },
  };

  //Verify and update the tab status on load.
  updateTabTier(tier: string) {
    switch (tier) {
      case '1':
        this.t1_state = Tier_States.Unlocked.toString();
        this.t2_state = Tier_States.Locked.toString();
        this.t3_state = Tier_States.Locked.toString();
        break;
      case '2':
        this.t1_state = Tier_States.Unlocked.toString();
        this.t2_state = Tier_States.Unlocked.toString();
        this.t3_state = Tier_States.Locked.toString();
        break;
      case '3':
        this.t1_state = Tier_States.Unlocked.toString();
        this.t2_state = Tier_States.Unlocked.toString();
        this.t3_state = Tier_States.Unlocked.toString();
        break;
      default:
        this.t1_state = Tier_States.Locked.toString();
        this.t2_state = Tier_States.Locked.toString();
        this.t3_state = Tier_States.Locked.toString();
        break;
    }
  }

  onSubmit() {
    //Validate all 3 forms.
    this.updateModelTier();

    //Save the model for session use.
    sessionStorage.setItem('model', JSON.stringify(this.model));

    //Set the connectionID.
    this.connectionId = this.sharingService.getConnectionId();

    // console.log('In onSubmit');
    if (this.form.valid) {
      this.showAlert();
      if (this.alertConfirmation) {
        this.setData(this.model);
        //this.sharingService.setData(this.model);
        this._router.navigate(['processing']);
        // setTimeout(() => this._router.navigate(['processing']), 2000);
      }
    }
  }

  validateTierOne() {
    if (this.form.controls[0].status == 'VALID') {
      this.options.formState.tierOne = true;
      this.t1_state = Tier_States.Unlocked.toString();
    } else if (this.form.controls[0].status == 'INVALID') {
      this.options.formState.tierOne = false;
      this.t1_state = Tier_States.Errors.toString();
    } else {
      this.options.formState.tierOne = false;
      this.t1_state = Tier_States.Locked.toString();
    }

    //Here can be added the list of fields with errors for this tier.
  }

  validateTierTwo() {
    console.log(typeof this.form.controls[1].value);

    if (this.options.formState.tierOne) {
      if (this.form.controls[1].status == 'VALID') {
        let control: boolean = false;
        const fields = Object.entries(this.form.controls[1].value);

        fields.forEach(([key, value]) => {
          if (value === '' || value === ' ') {
            control = true;
          }
        });

        if (!control) {
          this.options.formState.tierTwo = true;
          this.t2_state = Tier_States.Unlocked.toString();
        } else {
          if (this.form.controls[1].untouched) {
            this.options.formState.tierTwo = false;
            this.t2_state = Tier_States.Locked.toString();
          } else {
            this.options.formState.tierTwo = false;
            this.t2_state = Tier_States.Errors.toString();
          }
        }
      } else if (this.form.controls[1].status == 'INVALID') {
        this.options.formState.tierTwo = false;
        this.t2_state = Tier_States.Errors.toString();
      } else {
        this.options.formState.tierTwo = false;
        this.t2_state = Tier_States.Locked.toString();
      }
    } else {
      this.options.formState.tierTwo = false;
      this.t2_state = Tier_States.Locked.toString();
    }
  }

  validateTierThree() {
    if (this.options.formState.tierTwo) {
      if (this.form.controls[2].status == 'VALID') {
        let control: boolean = false;
        const fields = Object.entries(this.form.controls[2].value);

        fields.forEach(([key, value]) => {
          if (value == '') {
            control = true;
          }
        });
        if (!control) {
          this.options.formState.tierThree = true;
          this.t3_state = Tier_States.Unlocked.toString();
        } else {
          if (this.form.controls[2].untouched) {
            this.options.formState.tierThree = false;
            this.t3_state = Tier_States.Locked.toString();
          } else {
            this.options.formState.tierThree = false;
            this.t3_state = Tier_States.Errors.toString();
          }
        }
      } else if (this.form.controls[2].status == 'INVALID') {
        this.options.formState.tierThree = false;
        this.t3_state = Tier_States.Errors.toString();
      } else {
        this.options.formState.tierThree = false;
        this.t3_state = Tier_States.Locked.toString();
      }
    } else {
      this.options.formState.tierThree = false;
      this.t3_state = Tier_States.Locked.toString();
    }
  }

  showAlert() {
    this.alert = true;

    let alertObj = document.getElementById('alert');

    if (alertObj != undefined || alertObj != null) {
      let alert = alertObj.firstElementChild;
      alert.classList.add('scale-in-ver-top');
      // this.alertType = '';
      // this.alertTitle = '';
      // this.alertMsg = '';
      // this.alertDisabled = false;
    }

    if (this.form.valid) {
      this.alertDisabled = false;
    } else {
      this.alertDisabled = true;
    }

    if (this.t1_state == Tier_States.Unlocked) {
      this.alertType = 'success';
      this.alertTitle = 'TIER 1 Credentials';
      this.alertMsg = 'Click in the confirm button to proceed.';
      this.alertDisabled = false;
    } else if (this.t1_state == Tier_States.Errors) {
      this.alertType = 'danger';
      this.alertTitle = 'Error in TIER 1 fields';
      this.alertMsg = 'Please review the mandatory fields.';
      this.alertDisabled = true;
    }

    if (this.t2_state == Tier_States.Unlocked) {
      this.alertType = 'warning';
      this.alertMsg =
        "When clicking the CONFIRM button, your information needs to be validated by Vital Stats. If the validation is successfully, you'll receive your TIER 2 credentials automatically.  ";
      this.alertTitle = 'TIER 2 Credentials';
      this.alertDisabled = false;
    } else if (this.t2_state == Tier_States.Errors) {
      this.alertType = 'danger';
      this.alertTitle = 'Error in TIER 2 fields';
      this.alertMsg = 'Please review the fields in it.';
      this.alertDisabled = true;
    }

    if (this.t3_state == Tier_States.Unlocked) {
      this.alertType = 'warning';
      this.alertMsg =
        "When clicking the CONFIRM button, your information needs to be validated by Vital Stats. If the validation is successfully, you'll receive your TIER 2 credentials automatically. ";
      this.alertTitle = 'TIER 3 Credentials';
      this.alertDisabled = false;
    } else if (this.t3_state == Tier_States.Errors) {
      this.alertType = 'danger';
      this.alertTitle = 'Error in TIER 3 fields';
      this.alertMsg = 'Please review the fields in it.';
      this.alertDisabled = true;
    }
  }

  toggleConfirmation(test: boolean) {
    if (test) {
      this.alertConfirmation = true;
    } else {
      this.alertConfirmation = false;
    }
  }

  updateModelTier() {
    this.validateTierOne();
    this.validateTierTwo();
    this.validateTierThree();

    if (
      this.options.formState.tierOne &&
      this.options.formState.tierTwo &&
      this.options.formState.tierThree
    ) {
      this.model.tier = 3;
    } else if (
      this.options.formState.tierOne &&
      this.options.formState.tierTwo
    ) {
      this.model.tier = 2;
    } else if (this.options.formState.tierOne) {
      this.model.tier = 1;
    } else {
      this.model.tier = 0;
    }
  }

  collapseTabs(current: string) {
    let t1 = document.getElementById('tierOne');
    let t2 = document.getElementById('tierTwo');
    let t3 = document.getElementById('tierThree');

    let alertObj = document.getElementById('alert');

    if (alertObj != undefined || alertObj != null) {
      let alert = alertObj.firstElementChild;
      alert.classList.add('fade-out-bottom');
    }

    if (current == 'tierOne') {
      this.t1_collapse = false;
      this.t2_collapse = true;
      this.t3_collapse = true;
      t1.classList.add('show');
      t2.classList.remove('show');
      t3.classList.remove('show');
    } else if (current == 'tierTwo') {
      this.t1_collapse = true;
      this.t2_collapse = false;
      this.t3_collapse = true;
      t2.classList.add('show');
      t1.classList.remove('show');
      t3.classList.remove('show');
    } else if (current == 'tierThree') {
      this.t1_collapse = true;
      this.t2_collapse = true;
      this.t3_collapse = false;
      t3.classList.add('show');
      t2.classList.remove('show');
      t1.classList.remove('show');
    }
  }
}
