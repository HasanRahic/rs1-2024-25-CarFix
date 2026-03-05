using System;
using Core.Entities;

namespace Core.Specifications;

public class TypeListSpecification : BaseSpecification<Product, string>
{
    public TypeListSpecification() : base(x => !x.IsDeleted)
    {
        AddSelect(x => x.Type);
        ApplyDistinct();
    }
}
