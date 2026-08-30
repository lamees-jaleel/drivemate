import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { Location } from '@angular/common';
import {
  HttpErrorResponse
} from '@angular/common/http';

import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import {
  AuthService
} from '../../services/auth.service';

import {
  Vehicle,
  VehicleService
} from '../../services/vehicle.service';

import {
  ComplianceStatus,
  DocumentService,
  VehicleDocument,
  VehicleDocumentType
} from '../../services/document.service';

import { ToastService } from '../../shared/toast/toast.service';


@Component({
  selector: 'app-documents',

  standalone: true,

  imports: [
    ReactiveFormsModule,
    RouterLink
  ],

  templateUrl:
    './documents.html',

  styleUrl:
    './documents.css'
})
export class Documents
  implements OnInit {

  private readonly route =
    inject(ActivatedRoute);


  private readonly router =
    inject(Router);

  private readonly location =
    inject(Location);


  private readonly formBuilder =
    inject(FormBuilder);


  private readonly vehicleService =
    inject(VehicleService);


  private readonly documentService =
    inject(DocumentService);


  private readonly authService =
    inject(AuthService);

  private readonly toast =
    inject(ToastService);

  vehicle:
    Vehicle |
    null = null;


  documents:
    VehicleDocument[] = [];


  vehicles:
    Vehicle[] = [];


  showVehicleSelector =
    false;


  vehicleId = 0;

  isDirectRoute = false;



  complianceAlertCount =
    0;


  loading =
    true;


  submitted =
    false;


  isSubmitting =
    false;


  pageErrorMessage =
    '';


  formErrorMessage =
    '';


  successMessage =
    '';


  selectedFile:
    File |
    null = null;


  selectedFileName =
    '';


  fileErrorMessage =
    '';


  /* =======================================================
     TYPES
  ======================================================= */

  documentTypes: {
    value: VehicleDocumentType;
    label: string;
  }[] = [

    {
      value:
        'REGISTRATION_CERTIFICATE',

      label:
        'Registration Certificate'
    },

    {
      value:
        'INSURANCE',

      label:
        'Insurance'
    },

    {
      value:
        'POLLUTION_CERTIFICATE',

      label:
        'Pollution Certificate'
    },

    {
      value:
        'ROAD_TAX',

      label:
        'Road Tax'
    },

    {
      value:
        'FITNESS_CERTIFICATE',

      label:
        'Fitness Certificate'
    },

    {
      value:
        'WARRANTY',

      label:
        'Warranty'
    },

    {
      value:
        'SERVICE_DOCUMENT',

      label:
        'Service Document'
    },

    {
      value:
        'PURCHASE_INVOICE',

      label:
        'Purchase Invoice'
    },

    {
      value:
        'OTHER',

      label:
        'Other'
    }

  ];


  /* =======================================================
     FORM
  ======================================================= */

  documentForm =
    this.formBuilder.group({

      documentType: [
        '' as
          VehicleDocumentType |
          '',
        Validators.required
      ],


      title: [
        '',
        [
          Validators.required,

          Validators.maxLength(
            150
          )
        ]
      ],


      documentNumber: [
        '',
        [
          Validators.maxLength(
            120
          )
        ]
      ],


      provider: [
        '',
        [
          Validators.maxLength(
            150
          )
        ]
      ],


      issueDate: [
        ''
      ],


      expiryDate: [
        ''
      ],


      notes: [
        '',
        [
          Validators.maxLength(
            1000
          )
        ]
      ]

    });


  get f() {

    return this.documentForm
      .controls;

  }


  /* =======================================================
     SUMMARY
  ======================================================= */

  get documentCount():
    number {

    return this.documents
      .length;

  }


  get validDocumentCount():
    number {

    return this.documents
      .filter(
        document =>
          document.complianceStatus ===
          'VALID'
      )
      .length;

  }


  /* =======================================================
     INIT
  ======================================================= */

  ngOnInit(): void {

    const idParam =
      this.route.snapshot.paramMap.get('id');


    if (!idParam) {
      this.isDirectRoute = false;

      this.loadAllVehicles();

      return;

    }


    this.isDirectRoute = true;

    const id =
      Number(idParam);


    if (
      !Number.isInteger(
        id
      ) ||
      id <= 0
    ) {

      this.loadAllVehicles();

      return;

    }


    this.vehicleId =
      id;


    this.loadVehicle();

  }


  loadAllVehicles(): void {

    this.loading =
      true;


    this.vehicleService
      .getMyVehicles()
      .subscribe({

        next: response => {

          this.vehicles =
            response.vehicles;


          if (
            this.vehicles.length ===
            0
          ) {

            this.pageErrorMessage =
              'You do not have any registered vehicles yet.';

            this.loading =
              false;

          }

          else if (
            this.vehicles.length ===
            1
          ) {

            this.vehicleId =
              this.vehicles[0].id;

            this.loadVehicle();

          }

          else {

            this.showVehicleSelector =
              true;

            this.loading =
              false;

          }

        },


        error: (
          err: HttpErrorResponse
        ) => {

          this.loading =
            false;


          this.pageErrorMessage =
            'Unable to load your vehicles. Please try again.';

        }

      });

  }


  selectVehicle(
    vehicleId: number
  ): void {

    this.vehicleId =
      vehicleId;


    this.showVehicleSelector =
      false;


    this.loadVehicle();

  }


  /* =======================================================
     VEHICLE
  ======================================================= */

  
  goBack(event: Event): void {
    event.preventDefault();
    this.location.back();
  }

  clearSelection(): void {
    this.vehicle = null;
    this.vehicleId = 0;
    this.showVehicleSelector = true;
  }

  private loadVehicle():
    void {

    this.loading =
      true;


    this.vehicleService
      .getVehicleById(
        this.vehicleId
      )
      .subscribe({

        next: response => {

          this.vehicle =
            response.vehicle;


          this.loadDocuments();

        },


        error: (
          error:
            HttpErrorResponse
        ) => {

          this.handlePageError(
            error
          );

        }

      });

  }


  /* =======================================================
     DOCUMENTS
  ======================================================= */

  private loadDocuments():
    void {

    this.documentService
      .getDocuments(
        this.vehicleId
      )
      .subscribe({

        next: response => {

          this.documents =
            response.documents;


          this.complianceAlertCount =
            response
              .complianceAlertCount;


          this.loading =
            false;

        },


        error: (
          error:
            HttpErrorResponse
        ) => {

          this.handlePageError(
            error
          );

        }

      });

  }


  /* =======================================================
     PAGE ERROR
  ======================================================= */

  private handlePageError(
    error:
      HttpErrorResponse
  ): void {

    this.loading =
      false;


    console.error(
      'Documents page error:',
      error
    );


    if (
      error.status ===
      401
    ) {

      this.authService
        .clearSession();


      this.router.navigate(
        [
          '/login'
        ]
      );


      return;

    }


    if (
      error.status ===
      404
    ) {

      this.pageErrorMessage =
        'Vehicle not found.';


      return;

    }


    this.pageErrorMessage =
      error.error?.message ||
      'Unable to load vehicle documents.';

  }


  /* =======================================================
     ERROR VISIBILITY
  ======================================================= */

  showError(
    control:
      AbstractControl
  ): boolean {

    return (
      control.invalid &&
      (
        control.touched ||
        this.submitted
      )
    );

  }


  /* =======================================================
     FILE SELECTION
  ======================================================= */

  onFileSelected(
    event: Event
  ): void {

    this.fileErrorMessage =
      '';


    const input =
      event.target as
        HTMLInputElement;


    const file =
      input.files?.[0];


    if (!file) {

      this.selectedFile =
        null;


      this.selectedFileName =
        '';


      return;

    }


    const allowedTypes =
      [
        'application/pdf',
        'image/jpeg',
        'image/png'
      ];


    const maximumSize =
      5 * 1024 * 1024;


    if (
      !allowedTypes.includes(
        file.type
      )
    ) {

      this.selectedFile =
        null;


      this.selectedFileName =
        '';


      input.value =
        '';


      this.fileErrorMessage =
        'Only PDF, JPG, JPEG and PNG files are allowed.';


      return;

    }


    if (
      file.size >
      maximumSize
    ) {

      this.selectedFile =
        null;


      this.selectedFileName =
        '';


      input.value =
        '';


      this.fileErrorMessage =
        'Document file must not exceed 5 MB.';


      return;

    }


    this.selectedFile =
      file;


    this.selectedFileName =
      file.name;

  }


  /* =======================================================
     SUBMIT
  ======================================================= */

  submit(): void {

    if (
      this.isSubmitting
    ) {

      return;

    }


    this.submitted =
      true;


    this.formErrorMessage =
      '';


    this.successMessage =
      '';


    this.documentForm
      .markAllAsTouched();


    if (
      this.documentForm.invalid
    ) {

      return;

    }


    if (!this.selectedFile) {

      this.fileErrorMessage =
        'Please choose a document file.';


      return;

    }


    const values =
      this.documentForm
        .getRawValue();


    /*
      Optional date consistency check
      before sending to backend.
    */

    if (
      values.issueDate &&
      values.expiryDate
    ) {

      const issueDate =
        new Date(
          `${values.issueDate}T00:00:00`
        );


      const expiryDate =
        new Date(
          `${values.expiryDate}T00:00:00`
        );


      if (
        expiryDate <
        issueDate
      ) {

        this.formErrorMessage =
          'Expiry date cannot be before the issue date.';


        return;

      }

    }


    const formData =
      new FormData();


    formData.append(
      'documentType',
      values.documentType as
        VehicleDocumentType
    );


    formData.append(
      'title',
      (
        values.title ??
        ''
      ).trim()
    );


    if (
      values.documentNumber
        ?.trim()
    ) {

      formData.append(
        'documentNumber',
        values.documentNumber
          .trim()
      );

    }


    if (
      values.provider
        ?.trim()
    ) {

      formData.append(
        'provider',
        values.provider
          .trim()
      );

    }


    if (
      values.issueDate
    ) {

      formData.append(
        'issueDate',
        values.issueDate
      );

    }


    if (
      values.expiryDate
    ) {

      formData.append(
        'expiryDate',
        values.expiryDate
      );

    }


    if (
      values.notes
        ?.trim()
    ) {

      formData.append(
        'notes',
        values.notes
          .trim()
      );

    }


    formData.append(
      'documentFile',
      this.selectedFile
    );


    this.isSubmitting =
      true;


    this.documentService
      .addDocument(
        this.vehicleId,
        formData
      )
      .subscribe({

        next: response => {

          this.isSubmitting =
            false;


          this.submitted =
            false;


          this.successMessage =
            response.message;


          this.documentForm
            .reset({

              documentType:
                '',

              title:
                '',

              documentNumber:
                '',

              provider:
                '',

              issueDate:
                '',

              expiryDate:
                '',

              notes:
                ''

            });


          this.selectedFile =
            null;


          this.selectedFileName =
            '';


          this.fileErrorMessage =
            '';


          const fileInput =
            document.getElementById(
              'documentFile'
            ) as
              HTMLInputElement |
              null;


          if (fileInput) {

            fileInput.value =
              '';

          }


          this.loadDocuments();

        },


        error: (
          error:
            HttpErrorResponse
        ) => {

          this.isSubmitting =
            false;


          console.error(
            'Add document failed:',
            error
          );


          if (
            error.status ===
            401
          ) {

            this.authService
              .clearSession();


            this.router.navigate(
              [
                '/login'
              ]
            );


            return;

          }


          const errors =
            error.error?.errors as
              Record<string, string> |
              undefined;


          this.formErrorMessage =
            errors
              ? Object.values(
                  errors
                ).join(' ')
              : (
                  error.error?.message ||
                  'Unable to upload document.'
                );

        }

      });

  }


  /* =======================================================
     LABELS
  ======================================================= */

  getDocumentTypeLabel(
    type:
      VehicleDocumentType
  ): string {

    return (
      this.documentTypes
        .find(
          item =>
            item.value ===
            type
        )
        ?.label ??
      type
    );

  }


  getComplianceLabel(
    status:
      ComplianceStatus
  ): string {

    switch (status) {

      case 'VALID':

        return 'Valid';


      case 'EXPIRING_SOON':

        return 'Expiring Soon';


      case 'EXPIRED':

        return 'Expired';


      default:

        return 'No Expiry';

    }

  }


  getStatusClass(
    status:
      ComplianceStatus
  ): string {

    switch (status) {

      case 'VALID':

        return 'status-valid';


      case 'EXPIRING_SOON':

        return 'status-warning';


      case 'EXPIRED':

        return 'status-expired';


      default:

        return 'status-neutral';

    }

  }


  /* =======================================================
     DATE
  ======================================================= */

  formatDate(
    value:
      string |
      null |
      undefined
  ): string {

    if (!value) {

      return 'Not specified';

    }


    const date =
      new Date(
        value
      );


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

      return 'Not specified';

    }


    return new Intl.DateTimeFormat(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }
    ).format(
      date
    );

  }


  /* =======================================================
     FILE SIZE
  ======================================================= */

  formatFileSize(
    bytes:
      number |
      null
  ): string {

    if (
      bytes ===
      null
    ) {

      return 'Unknown size';

    }


    if (
      bytes <
      1024
    ) {

      return `${bytes} B`;

    }


    if (
      bytes <
      1024 * 1024
    ) {

      return `${(
        bytes /
        1024
      ).toFixed(1)} KB`;

    }


    return `${(
      bytes /
      (
        1024 *
        1024
      )
    ).toFixed(1)} MB`;

  }

  renewDocument(document: VehicleDocument): void {
    this.documentForm.patchValue({
      documentType: document.documentType,
      title: document.title,
      provider: document.provider,
      documentNumber: document.documentNumber
    });

    this.selectedFile = null;
    const fileInput = window.document.getElementById('fileUpload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }

    this.toast.show('Form pre-filled. Please upload your new document and update the dates.', 'info');
    
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

}


