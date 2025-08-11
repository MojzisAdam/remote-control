<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DynamicDataTransformationResourceDaitsu extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $requestedFields = $request->selectedMetrics ?? [];
        $filteredData = ['cas' => $this->cas];

        $transformations = [
            'T1s_z1' => fn() => ($this->reg_136 != 255) ? $this->reg_136 : (($this->reg_2 >> 8) & 0xFF),
            'T1s_z2' => fn() => ($this->reg_137 != 255) ? $this->reg_137 : ($this->reg_2 & 0xFF),
            'reg_4' => fn() => $this->reg_4,
            'reg_100' => fn() => $this->reg_100,
            'reg_101' => fn() => $this->transformVjedn($this->reg_101),
            'reg_104' => fn() => $this->reg_104,
            'reg_105' => fn() => $this->reg_105,
            'reg_106' => fn() => $this->reg_106,
            'reg_107' => fn() => $this->reg_107,
            'reg_108' => fn() => $this->reg_108,
            'reg_109' => fn() => $this->reg_109,
            'reg_110' => fn() => $this->reg_110,
            'reg_111' => fn() => $this->reg_111,
            'reg_112' => fn() => $this->reg_112,
            'reg_113' => fn() => $this->reg_113,
            'reg_115' => fn() => $this->reg_115,
            'reg_124' => fn() => ($this->reg_124 == 0) ? 0 : -6,
            'reg_128_1' => fn() => ($this->reg_128_1 == 0) ? 0 : 4,
            'reg_128_4' => fn() => ($this->reg_128_4 == 0) ? 0 : 3,
            'reg_128_6' => fn() => ($this->reg_128_6 == 0) ? 0 : 2,
            'reg_129_0' => fn() => ($this->reg_129_0 == 0) ? 0 : 5,
            'reg_129_2' => fn() => ($this->reg_129_2 == 0) ? 0 : 7,
            'reg_129_13' => fn() => ($this->reg_129_13 == 0) ? 0 : 11,
            'reg_129_14' => fn() => ($this->reg_129_14 == 0) ? 0 : 9,
            'reg_138' => fn() => $this->reg_138,
            'reg_140' => fn() => $this->reg_140,
        ];

        foreach ($transformations as $key => $transform) {
            if (in_array($key, $requestedFields)) {
                $filteredData[$key] = $transform();
            }
        }

        return $filteredData;
    }
    protected function transformVjedn($vjedn)
    {
        $mapping = [
            0 => 0,
            2 => 3,
            3 => 5
        ];

        return $mapping[$vjedn] ?? $vjedn;
    }
}