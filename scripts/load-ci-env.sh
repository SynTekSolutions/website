#!/bin/bash

# Clerk publishable key fallback
if [ -z "$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" ]; then
  export NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_cmVsYXRpdmUtYnVjay03MC5jbGVyay5hY2NvdW50cy5kZXYk"
  echo "Using default fallback NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
fi

# Clerk secret key fallback
if [ -z "$CLERK_SECRET_KEY" ]; then
  export CLERK_SECRET_KEY="sk_test_dummy_clerk_secret_key_from_ci_pipeline"
  echo "Using default fallback CLERK_SECRET_KEY"
fi

# Clerk webhook secret fallback
if [ -z "$CLERK_WEBHOOK_SECRET" ]; then
  export CLERK_WEBHOOK_SECRET="whsec_dummy_webhook_secret_from_ci_pipeline"
  echo "Using default fallback CLERK_WEBHOOK_SECRET"
fi
