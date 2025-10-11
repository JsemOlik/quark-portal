<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class BillingController extends Controller
{
    public function portal(Request $request)
    {
        $user = $request->user();

        // Ensure Stripe customer exists (Cashier)
        $user->createOrGetStripeCustomer();

        $returnUrl = route('dashboard.index');

        // Cashier helper to redirect to Stripe Customer Portal
        return $user->redirectToBillingPortal($returnUrl);
    }
}
