using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace SharedLibrary.Common.Converters
{
    public class TimeOnlyAmPmConverter : JsonConverter<TimeOnly>
    {
        private const string Format = "hh:mm tt"; // Jemon: "02:30 PM"

        public override TimeOnly Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            string? value = reader.GetString();

            if (string.IsNullOrWhiteSpace(value))
            {
                return TimeOnly.MinValue;
            }

            // AM/PM format ba onnanno standard format parse kora
            if (TimeOnly.TryParseExact(value, new[] { "hh:mm tt", "h:mm tt", "hh:mm:ss tt", "HH:mm", "HH:mm:ss" },
                CultureInfo.InvariantCulture, DateTimeStyles.None, out TimeOnly parsedTime))
            {
                return parsedTime;
            }

            throw new JsonException($"Unable to convert \"{value}\" to TimeOnly.");
        }

        public override void Write(Utf8JsonWriter writer, TimeOnly value, JsonSerializerOptions options)
        {
            // JSON response-e "02:30 PM" format-e pathabe
            writer.WriteStringValue(value.ToString(Format, CultureInfo.InvariantCulture));
        }
    }
}
