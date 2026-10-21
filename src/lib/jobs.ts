/**
 * Pure, side-effect-free helpers for working with job postings.
 *
 * These operate on plain `Job[]` arrays (already loaded from the content
 * collection by the calling page) so they can be unit tested without the Astro
 * content runtime or a database.
 */
import type { Job } from '../types/job';

const countryNames: Record<string, string> = {
    canada: 'Canada',
    finland: 'Finland',
    india: 'India',
    netherlands: 'Netherlands',
    uk: 'United Kingdom',
    'united kingdom': 'United Kingdom',
    'united states': 'United States',
    us: 'United States',
    usa: 'United States',
};

function normalizeCountry(country: string): string | undefined {
    return countryNames[country.trim().toLowerCase()];
}

/** Return the country or countries represented by a job location. */
export function getCountriesFromLocation(location: string): string[] {
    const remoteLocation = location.match(/^remote\s*\(([^)]+)\)$/i);
    if (remoteLocation) {
        return [...new Set(
            remoteLocation[1]
                .split('&')
                .map((country) => normalizeCountry(country))
                .filter((country): country is string => country !== undefined),
        )];
    }

    const country = normalizeCountry(location.split(',').at(-1) ?? '');
    return country ? [country] : [];
}

/** Return jobs sorted by posted date, newest first (does not mutate input). */
export function sortByNewest(jobs: Job[]): Job[] {
    return [...jobs].sort(
        (a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime(),
    );
}

/**
 * Format an ISO-8601 date as a human-readable posted date,
 * e.g. "January 5, 2027". Falls back to the raw value if unparseable.
 */
export function formatPostedDate(iso: string): string {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) {
        return iso;
    }
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC',
    });
}
