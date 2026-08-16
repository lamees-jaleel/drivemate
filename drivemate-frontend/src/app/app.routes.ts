import {
  Routes
} from '@angular/router';

import {
  Landing
} from './pages/landing/landing';

import {
  Login
} from './pages/login/login';

import {
  Register
} from './pages/register/register';

import {
  OwnerDashboard
} from './pages/owner-dashboard/owner-dashboard';

import {
  ExpertDashboard
} from './pages/expert-dashboard/expert-dashboard';

import {
  ComplianceDashboard
} from './pages/compliance-dashboard/compliance-dashboard';

import {
  ResponderDashboard
} from './pages/responder-dashboard/responder-dashboard';

import {
  AdminDashboard
} from './pages/admin-dashboard/admin-dashboard';

import {
  AddVehicle
} from './pages/add-vehicle/add-vehicle';

import {
  MyVehicles
} from './pages/my-vehicles/my-vehicles';

import {
  VehicleDetails
} from './pages/vehicle-details/vehicle-details';

import {
  Maintenance
} from './pages/maintenance/maintenance';

import {
  Expenses
} from './pages/expenses/expenses';

import {
  Documents
} from './pages/documents/documents';

import {
  roleAuthGuard
} from './guards/role-auth.guard';


export const routes:
  Routes = [

  /* =======================================================
     PUBLIC
  ======================================================= */

  {
    path: '',
    component: Landing
  },


  {
    path: 'login',
    component: Login
  },


  {
    path: 'register',
    component: Register
  },


  /* =======================================================
     VEHICLE OWNER
  ======================================================= */

  {
    path:
      'owner-dashboard',

    component:
      OwnerDashboard,

    canActivate: [
      roleAuthGuard
    ],

    data: {
      role:
        'VEHICLE_OWNER'
    }
  },


  {
    path:
      'owner-dashboard/add-vehicle',

    component:
      AddVehicle,

    canActivate: [
      roleAuthGuard
    ],

    data: {
      role:
        'VEHICLE_OWNER'
    }
  },


  {
    path:
      'owner-dashboard/vehicles',

    component:
      MyVehicles,

    canActivate: [
      roleAuthGuard
    ],

    data: {
      role:
        'VEHICLE_OWNER'
    }
  },


  {
    path:
      'owner-dashboard/vehicles/:id',

    component:
      VehicleDetails,

    canActivate: [
      roleAuthGuard
    ],

    data: {
      role:
        'VEHICLE_OWNER'
    }
  },


  {
    path:
      'owner-dashboard/vehicles/:id/maintenance',

    component:
      Maintenance,

    canActivate: [
      roleAuthGuard
    ],

    data: {
      role:
        'VEHICLE_OWNER'
    }
  },


  {
    path:
      'owner-dashboard/vehicles/:id/expenses',

    component:
      Expenses,

    canActivate: [
      roleAuthGuard
    ],

    data: {
      role:
        'VEHICLE_OWNER'
    }
  },


  {
    path:
      'owner-dashboard/vehicles/:id/documents',

    component:
      Documents,

    canActivate: [
      roleAuthGuard
    ],

    data: {
      role:
        'VEHICLE_OWNER'
    }
  },


  /* =======================================================
     DIAGNOSTIC EXPERT
  ======================================================= */

  {
    path:
      'expert-dashboard',

    component:
      ExpertDashboard,

    canActivate: [
      roleAuthGuard
    ],

    data: {
      role:
        'DIAGNOSTIC_EXPERT'
    }
  },


  /* =======================================================
     COMPLIANCE ADVISOR
  ======================================================= */

  {
    path:
      'compliance-dashboard',

    component:
      ComplianceDashboard,

    canActivate: [
      roleAuthGuard
    ],

    data: {
      role:
        'COMPLIANCE_ADVISOR'
    }
  },


  /* =======================================================
     ROADSIDE RESPONDER
  ======================================================= */

  {
    path:
      'responder-dashboard',

    component:
      ResponderDashboard,

    canActivate: [
      roleAuthGuard
    ],

    data: {
      role:
        'ROADSIDE_RESPONDER'
    }
  },


  /* =======================================================
     ADMIN
  ======================================================= */

  {
    path:
      'admin-dashboard',

    component:
      AdminDashboard,

    canActivate: [
      roleAuthGuard
    ],

    data: {
      role:
        'ADMIN'
    }
  },


  /* =======================================================
     FALLBACK
  ======================================================= */

  {
    path: '**',
    redirectTo: ''
  }

];