
import { Calendar, MapPin, Clock, Users, Mail, Phone, Globe, PawPrint, Instagram } from "lucide-react";
import { format } from "date-fns";
import type { Event } from "@/types/events";

interface EventInformationProps {
  event: Event;
}

export function EventInformation({ event }: EventInformationProps) {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4 text-left">Event Details</h2>
        <div className="space-y-4">
          <p className="text-gray-600">{event.description}</p>
          <div className="grid gap-3 text-sm">
            <div className="flex items-center text-gray-600">
              <Calendar className="w-5 h-5 mr-3" />
              <span>{format(new Date(event.date), "PPP")}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Clock className="w-5 h-5 mr-3" />
              <span>{format(new Date(event.date), "p")}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <MapPin className="w-5 h-5 mr-3" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Users className="w-5 h-5 mr-3" />
              <span>Capacity: {event.capacity} people</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <PawPrint className="w-6 h-6 mr-2" />
          Pet Information
        </h2>
        <div className="space-y-3">
          <div>
            <strong className="text-gray-700">Allowed Pets:</strong>
            <span className="ml-2 text-gray-600">{event.pet_types}</span>
          </div>
          {event.pet_requirements && (
            <div>
              <strong className="text-gray-700">Requirements:</strong>
              <p className="mt-1 text-gray-600">{event.pet_requirements}</p>
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Organizer Details</h2>
        <div className="space-y-3">
          <div className="text-gray-600">
            <strong className="block">Organized by:</strong>
            <span>{event.organizer_name}</span>
          </div>
          <a
            href={`mailto:${event.organizer_email}`}
            className="flex items-center text-blue-600 hover:underline"
          >
            <Mail className="w-5 h-5 mr-3" />
            {event.organizer_email}
          </a>
          {event.organizer_phone && (
            <a
              href={`tel:${event.organizer_phone}`}
              className="flex items-center text-blue-600 hover:underline"
            >
              <Phone className="w-5 h-5 mr-3" />
              {event.organizer_phone}
            </a>
          )}
          {event.organizer_website && (
            <a
              href={event.organizer_website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-blue-600 hover:underline"
            >
              <Instagram className="w-5 h-5 mr-3" />
              Follow on Instagram
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
