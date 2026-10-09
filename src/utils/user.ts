interface Named {
  first_name?: string | null;
  last_name?: string | null;
}

/** "First Last", or whichever of the two is set; empty when neither is. */
export function getFullName({ first_name, last_name }: Named) {
  return [first_name?.trim(), last_name?.trim()].filter(Boolean).join(' ');
}

/** Upper-case initials for an avatar; empty when the user has no name. */
export function getInitials({ first_name, last_name }: Named) {
  return [first_name, last_name]
    .map((name) => name?.trim().charAt(0).toUpperCase() ?? '')
    .join('');
}
