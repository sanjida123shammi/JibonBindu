using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SharedLibrary.Models
{
    public class AssociatedStatus
    {
        public int AssociatedStatusId { get; set; }
        public required string StatusName { get; set; }
    }
}
