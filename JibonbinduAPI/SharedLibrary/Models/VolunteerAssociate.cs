using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SharedLibrary.Models
{
    public class VolunteerAssociate
    {
        public int VolunteerAssociateId { get; set; }

        public int PersonId { get; set; }
        public virtual Person Person { get; set; } = null!;

        public int AssociatedStatusId { get; set; }
        public virtual AssociatedStatus AssociatedStatus { get; set; } = null!;
    }
}
