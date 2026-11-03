import React from "react";
import { PropertiesService } from "@/features/properties/properties.service";
import { StaysListingClient } from "@/components/stays/stays-listing-client";

export default async function StaysPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const destination = typeof params.destination === "string" ? params.destination : undefined;

  const properties = await PropertiesService.getAll({ search: destination });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <StaysListingClient properties={properties} destination={destination} />
    </div>
  );
}
